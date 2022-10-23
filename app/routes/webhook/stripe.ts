import { ActionFunction, json } from '@remix-run/cloudflare'
import Stripe from 'stripe'
import { Address, Customer, Message, ProductCodeDelivery } from '~/utils/postNL'

const hexStringToUint8Array = (hexString: string) => {
  const bytes = new Uint8Array(Math.ceil(hexString.length / 2))
  for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hexString.substr(i * 2, 2), 16)
  return bytes
}

export const action: ActionFunction = async ({ context, request }) => {
  if (request.method !== 'POST') {
    return json('Request method error', 405)
  }

  if (!context?.STRIPE_KEY_ADMIN || !context.WEBHOOK_STRIPE_SIGNING_SECRET) {
    throw json('Missing environment variables', { status: 500 })
  }

  const signature = request.headers
    .get('Stripe-Signature')
    ?.split(',')
    .map(string => string.split('='))
  const signatureTimestamp = signature?.find(array => array[0] === 't')?.[1]
  const signatureV1 = signature?.find(array => array[0] === 'v1')?.[1]

  if (!signatureTimestamp || !signatureV1) {
    return json('No signature provided', 403)
  }

  const payloadRaw = await request.clone().text()

  const encoder = new TextEncoder()
  const verified = await crypto.subtle.verify(
    'HMAC',
    await crypto.subtle.importKey(
      'raw',
      encoder.encode(context.WEBHOOK_STRIPE_SIGNING_SECRET as string),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    ),
    hexStringToUint8Array(signatureV1),
    encoder.encode(`${signatureTimestamp}.${payloadRaw}`)
  )
  const elapsed = Math.floor(Date.now() / 1000) - Number(signatureTimestamp)
  if (!verified || elapsed > 300) {
    return json('Signature verify failed', 403)
  }

  const payload = (await request.json()) as {
    data: { object: Stripe.Checkout.Session }
    type: Stripe.Event['type']
  }

  const Authorization = `Bearer ${context.STRIPE_KEY_ADMIN}`

  switch (payload.type) {
    case 'checkout.session.completed':
      const sessionLineItems = (
        await (
          await fetch(`https://api.stripe.com/v1/checkout/sessions/${payload.data.object.id}/line_items?limit=50&expand[]=data.price.product`, {
            headers: { Authorization }
          })
        ).json<{ data: (Stripe.LineItem & { price: Stripe.Price & { product: Stripe.Product } })[] }>()
      ).data.map(item => ({ quantity: item.quantity, metadata: item.price.product.metadata }))

      for (const lineItem of sessionLineItems) {
        if (lineItem.metadata.contentful_id) {
          if (!lineItem.metadata.type) {
            console.warn('No type provided')
          } else {
            const entry = await (await fetch(`https://api.contentful.com/spaces/${context.CONTENTFUL_SPACE}/environments/master/entries/${lineItem.metadata.contentful_id}`, {
              headers: { Authorization: `Bearer ${context.CONTENTFUL_PAT}` }
            })).json<{ sys: { version: number }, fields: { typeAStock: { "en-GB": number }, typeBStock: { "en-GB": number }, typeCStock: { "en-GB": number } } }>()

            await fetch(`https://api.contentful.com/spaces/${context.CONTENTFUL_SPACE}/environments/master/entries/${lineItem.metadata.contentful_id}`, {
              method: 'PATCH',
              headers: {
                Authorization: `Bearer ${context.CONTENTFUL_PAT}`,
                'Content-Type': 'application/json-patch+json',
                'X-Contentful-Version': entry.sys.version.toString()
              },
              body: JSON.stringify([
                {
                  'op': 'replace',
                  'path': `/fields/type${lineItem.metadata.type}Stock/en-GB`,
                  // @ts-ignore
                  'value': entry.fields[`type${lineItem.metadata.type}Stock`]['en-GB'] - (lineItem.quantity || 0)
                }
              ])
            })
          }
        }
      }

      const shipping_rate = payload.data.object.shipping_cost?.shipping_rate
        ? (
          await (
            await fetch(
              `https://api.stripe.com/v1/shipping_rates/${payload.data.object.shipping_cost.shipping_rate}`,
              { headers: { Authorization } }
            )
          ).json<{ metadata: { label: false, weight?: number } | { label: true, weight: number } }>()
        ).metadata
        : { label: false } as { label: false }

      // @ts-ignore
      if (shipping_rate?.label !== true && shipping_rate?.label !== 'true') {
        return json('Shipping not required', 200)
      } else {
        const postnlData = {
          Customer: Customer(context),
          Message,
          Shipments: [
            {
              "Reference": payload.data.object.id,
              Addresses: [
                {
                  AddressType: '01',
                  ...Address(payload.data.object.customer_details)
                }
              ],
              Contacts: [
                {
                  ContactType: '01',
                  Email: payload.data.object.customer_details?.email,
                  SMSNr: payload.data.object.customer_details?.phone
                }
              ],
              Dimension: {
                Weight: shipping_rate.weight
              },
              ProductCodeDelivery
            }
          ]
        }

        const shipping = await (
          await fetch(`${context.WEBHOOK_STRIPE_POSTNL_URL}/v1/shipment`, {
            method: 'POST',
            headers: {
              apikey: context.WEBHOOK_STRIPE_POSTNL_API_KEY as string,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(postnlData)
          })
        ).json<any>()

        const barcode = shipping.ResponseShipments?.[0]?.Barcode
        if (barcode) {
          await fetch(
            `https://api.stripe.com/v1/payment_intents/${payload.data.object.payment_intent}`,
            {
              method: 'POST',
              headers: { Authorization, 'Content-Type': 'application/x-www-form-urlencoded' },
              body: new URLSearchParams({ 'metadata[shipping_tracking]': barcode })
            }
          )
          return json(`Barcode: ${barcode}`, 200)
        } else {
          return json(`Shipping creation failed: ${JSON.stringify(shipping)}`, 500)
        }
      }
      break
  }

  return json(null, 200)
}
