import { CarrierId, PackageTypeId } from '@myparcel/constants'
import { NETHERLANDS } from '@myparcel/constants/countries'
import { FetchClient, PostShipments, createPrivateSdk } from '@myparcel/sdk'
import type { ActionFunction, AppLoadContext } from 'react-router'
import { data } from 'react-router'
import Stripe from 'stripe'
import { getMyparcelAuthHeader } from '~/utils/myparcelAuthHeader'
import { getStripeHeaders } from '~/utils/stripeHeaders'

export const createShipment = async ({
  context,
  customer_details,
  payment_intent
}: {
  context: AppLoadContext
  customer_details: Stripe.Checkout.Session.CustomerDetails
  payment_intent: string
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> => {
  let error: string = ''

  const env = (context as any)?.cloudflare?.env
  const stripeHeaders = getStripeHeaders(env?.STRIPE_KEY_ADMIN)

  const result = await createPrivateSdk(
    new FetchClient({ headers: getMyparcelAuthHeader(context) }),
    [new PostShipments()]
  )
    .postShipments({
      body: [
        {
          carrier: CarrierId.PostNl,
          options: {
            package_type: PackageTypeId.Package,
            delivery_type: null
          },
          recipient:
            env?.ENVIRONMENT === 'DEVELOPMENT'
              ? {
                cc: NETHERLANDS,
                city: 'Rotterdam',
                postal_code: '3011PG',
                street: 'Hoogstraat 55A',
                person: '[TEST] Round',
                email: 'no-reply@roundandround.nl',
                phone: '0612345678'
              }
              : {
                cc: customer_details?.address?.country!,
                city: customer_details?.address?.city!,
                postal_code: customer_details?.address?.postal_code || '',
                street:
                  customer_details?.address?.line1 +
                  (customer_details?.address?.line2
                    ? ` ${customer_details?.address?.line2}`
                    : ''),
                person: customer_details?.name!,
                email: customer_details?.email || undefined,
                phone: customer_details?.phone || undefined
              }
        }
      ]
    })
    .catch(err => {
      error = err.message
      return err
    })

  const id = (result[0] as unknown as { id: string })?.id

  if (id) {
    await fetch(`https://api.stripe.com/v1/payment_intents/${payment_intent}`, {
      method: 'POST',
      headers: { ...stripeHeaders, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ 'metadata[shipping_id]': id.toString() })
    })
    return { ok: true, id }
  } else {
    return { ok: false, error }
  }
}

const hexStringToUint8Array = (hexString: string) => {
  const bytes = new Uint8Array(Math.ceil(hexString.length / 2))
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hexString.substr(i * 2, 2), 16)
  return bytes
}

export const action: ActionFunction = async ({ context, request }) => {
  if (request.method !== 'POST') {
    return data('Request method error', { status: 405 })
  }

  const env = (context as any)?.cloudflare?.env
  if (!env?.STRIPE_KEY_ADMIN || !env.WEBHOOK_STRIPE_SIGNING_SECRET) {
    throw data('Missing environment variables', { status: 500 })
  }

  const signature = request.headers
    .get('Stripe-Signature')
    ?.split(',')
    .map(string => string.split('='))
  const signatureTimestamp = signature?.find(array => array[0] === 't')?.[1]
  const signatureV1 = signature?.find(array => array[0] === 'v1')?.[1]

  if (!signatureTimestamp || !signatureV1) {
    return data('No signature provided', { status: 403 })
  }

  const payloadRaw = await request.text()

  const encoder = new TextEncoder()
  const verified = await crypto.subtle.verify(
    'HMAC',
    await crypto.subtle.importKey(
      'raw',
      encoder.encode(env.WEBHOOK_STRIPE_SIGNING_SECRET as string),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    ),
    hexStringToUint8Array(signatureV1),
    encoder.encode(`${signatureTimestamp}.${payloadRaw}`)
  )
  const elapsed = Math.floor(Date.now() / 1000) - Number(signatureTimestamp)
  if (!verified || elapsed > 300) {
    return data('Signature verify failed', { status: 403 })
  }

  const payload = JSON.parse(payloadRaw) as {
    data: { object: Stripe.Checkout.Session }
    type: Stripe.Event['type']
  }

  const stripeHeaders = getStripeHeaders(env.STRIPE_KEY_ADMIN)

  switch (payload.type) {
    case 'checkout.session.completed':
      const sessionLineItems = (
        await (
          await fetch(
            `https://api.stripe.com/v1/checkout/sessions/${payload.data.object.id}/line_items?limit=50&expand[]=data.price.product`,
            { headers: stripeHeaders }
          )
        ).json<{
          data: (Stripe.LineItem & { price: Stripe.Price & { product: Stripe.Product } })[]
        }>()
      ).data.map(item => ({ quantity: item.quantity, metadata: item.price.product.metadata }))

      for (const lineItem of sessionLineItems) {
        if (lineItem.metadata.contentful_id) {
          if (!lineItem.metadata.type) {
            console.warn('No type provided')
          } else {
            const entry = await (
              await fetch(
                `https://api.contentful.com/spaces/${env.CONTENTFUL_SPACE}/environments/master/entries/${lineItem.metadata.contentful_id}`,
                {
                  headers: { Authorization: `Bearer ${env.CONTENTFUL_PAT}` }
                }
              )
            ).json<{
              sys: { id: string; version: number }
              fields: {
                typeAStock?: { 'en-GB': number }
                typeBStock?: { 'en-GB': number }
                typeCStock?: { 'en-GB': number }
              }
            }>()

            const contentfulType = lineItem.metadata.type as 'A' | 'B' | 'C'
            const stock = entry.fields[`type${contentfulType}Stock`]?.['en-GB']

            if (!stock || typeof stock !== 'number') {
              continue
            }
            if (stock === 0) {
              throw data({ error: `Stock of ${entry.sys.id} is 0!` }, { status: 500 })
            }

            await fetch(
              `https://api.contentful.com/spaces/${env.CONTENTFUL_SPACE}/environments/master/entries/${lineItem.metadata.contentful_id}`,
              {
                method: 'PATCH',
                headers: {
                  Authorization: `Bearer ${env.CONTENTFUL_PAT}`,
                  'Content-Type': 'application/json-patch+json',
                  'X-Contentful-Version': entry.sys.version.toString()
                },
                body: JSON.stringify([
                  {
                    op: 'replace',
                    path: `/fields/type${lineItem.metadata.type}Stock/en-GB`,
                    value: stock - (lineItem.quantity || 0)
                  }
                ])
              }
            )
          }
        }
      }

      const shipping_rate = payload.data.object.shipping_cost?.shipping_rate
        ? (
          await (
            await fetch(
              `https://api.stripe.com/v1/shipping_rates/${payload.data.object.shipping_cost.shipping_rate}`,
              { headers: stripeHeaders }
            )
          ).json<{
            metadata: { label: 'false'; weight?: number } | { label: 'true'; weight: number }
          }>()
        ).metadata
        : ({ label: 'false' } as const)

      if (shipping_rate?.label === 'true') {
        const resShipment = await createShipment({
          context,
          customer_details: payload.data.object.customer_details!,
          payment_intent: payload.data.object.payment_intent as string
        })

        if (resShipment.ok) {
          return data(`Shipment: ${resShipment.id}`)
        } else {
          return data('Shipping creation failed', { status: 500 })
        }
      } else {
        return data(
          'Shipping not required' + ' ' + env?.ENVIRONMENT + ' ' + shipping_rate?.label
        )
      }
  }

  return data(null)
}
