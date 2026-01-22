import type { LoaderFunctionArgs } from 'react-router'
import { data } from 'react-router'
import { isAfter, isBefore, isSameDay, parseISO } from 'date-fns'
import { gql } from 'graphql-request'
import { sumBy } from 'lodash'
import { CakeOrder } from '~/states/bag'
import calShipping from './calShipping'
import { Cake, graphqlRequest, Shipping } from './contentful'
import { formatDateForDisplay } from './dateHelpers'
import { correctPickup } from './pickup'
import { getReadableDeliveryDate } from './readableDeliveryDate'
import { getStripeHeaders } from './stripeHeaders'

const getEnv = (context: LoaderFunctionArgs['context']) => (context as any)?.cloudflare?.env

// Mapping from 3-letter (ISO 3166-1 alpha-3) to 2-letter (ISO 3166-1 alpha-2) country codes
// Stripe requires 2-letter codes, but the frontend uses 3-letter codes
const countryCode3To2: Record<string, string> = {
  NLD: 'NL',
  BEL: 'BE',
  DEU: 'DE',
  FRA: 'FR',
  LUX: 'LU',
  DNK: 'DK',
  ITA: 'IT',
  AUT: 'AT',
  ESP: 'ES',
  SWE: 'SE',
}

export type CheckoutContent = {
  cards?: boolean
  countryCode?: string
  paperBag?: boolean
  orders: {
    pickup?: CakeOrder[]
    shipping?: CakeOrder[]
  }
  pickup_date?: string
  notes?: string
  gift_card?: string
  birthday_cake_voucher?: string
  subtotal_amount?: string // Should be float
  shipping_amount?: string // Should be float
  success_url?: string
  cancel_url?: string
}

type ShippingOptions = {
  shipping_rate_data: {
    display_name: string
    type: 'fixed_amount'
    fixed_amount: {
      amount: number
      currency: 'eur'
    }
    metadata?: { label?: 'true' | 'false'; weight: number }
  }
}

const verifyContentful = async ({
  context,
  content: { orders, subtotal_amount, shipping_amount, countryCode, pickup_date }
}: {
  context: LoaderFunctionArgs['context']
  content: CheckoutContent
}): Promise<ShippingOptions | null> => {
  if ((!orders.pickup?.length && !orders.shipping?.length) || !subtotal_amount) {
    throw 'Submitted checkout content error'
  }

  const flatOrders = [...(orders.pickup || []), ...(orders.shipping || [])]

  // Check cakes
  if (flatOrders?.length) {
    const items = (
      await graphqlRequest<{
        cakeCollection: {
          items: Pick<
            Cake,
            | 'sys'
            | 'available'
            | 'typeAAvailable'
            | 'typeAPrice'
            | 'typeAStock'
            | 'typeAMinimum'
            | 'typeBAvailable'
            | 'typeBPrice'
            | 'typeBStock'
            | 'typeBMinimum'
            | 'typeCAvailable'
            | 'typeCPrice'
            | 'typeCStock'
            | 'typeCMinimum'
            | 'pickupNotAvailableStart'
            | 'pickupNotAvailableEnd'
            | 'deliveryCustomizations'
            | 'shippingWeight'
            | 'shippingAvailable'
          >[]
        }
      }>({
        context,
        variables: { ids: flatOrders.map(b => b.sys.id) },
        query: gql`
          query Cakes($preview: Boolean, $ids: [String]) {
            cakeCollection(preview: $preview, where: { sys: { id_in: $ids } }) {
              items {
                sys {
                  id
                }
                available
                typeAAvailable
                typeAPrice
                typeAStock
                typeAMinimum
                typeBAvailable
                typeBPrice
                typeBStock
                typeBMinimum
                typeCAvailable
                typeCPrice
                typeCStock
                typeCMinimum
                pickupNotAvailableStart
                pickupNotAvailableEnd
                deliveryCustomizations
                shippingWeight
                shippingAvailable
              }
            }
          }
        `
      })
    ).cakeCollection.items

    if (items.length === 0 || items.length !== flatOrders.length) {
      throw 'Cake not found'
    }

    for (const item of items) {
      const objectIndex = flatOrders.findIndex(i => i.sys.id === item.sys.id)

      if (objectIndex < 0) {
        throw 'Cake not found'
      }

      const order = flatOrders[objectIndex]
      if (!item[`type${order.chosen.unit}Available`]) {
        throw 'Cake availability error'
      }
      const stock = item[`type${order.chosen.unit}Stock`]
      if (stock && order.chosen.amount > stock) {
        throw 'Cake quantity exceeded'
      }
      if (order.chosen.amount < (item[`type${order.chosen.unit}Minimum`] || 1)) {
        throw 'Cake quantity error'
      }
      if (order[`type${order.chosen.unit}Price`] !== item[`type${order.chosen.unit}Price`]) {
        throw 'Cake pricing error'
      }

      if (pickup_date && (order.pickupNotAvailableStart || order.pickupNotAvailableEnd)) {
        const dates = correctPickup(order)
        if (dates.start && dates.end) {
          if (
            isAfter(parseISO(dates.start), parseISO(pickup_date)) &&
            isBefore(parseISO(dates.end), parseISO(pickup_date))
          ) {
            throw 'Pickup date not available'
          }
        }

        if (dates.start && isAfter(parseISO(dates.start), parseISO(pickup_date))) {
          throw 'Pickup date not available'
        }
        if (dates.end && isBefore(parseISO(dates.end), parseISO(pickup_date))) {
          throw 'Pickup date not available'
        }
      }

      if (!!order.chosen.delivery?.date) {
        const chosenDate = order.chosen.delivery?.date

        const delivery = item.deliveryCustomizations?.[order.chosen.delivery.type]
        if (Array.isArray(delivery?.availability)) {
          const matchedAvailability = delivery?.availability.find(a =>
            isSameDay(parseISO(chosenDate), parseISO(a.date))
          )
          if (!matchedAvailability) {
            throw 'Chosen date not exist'
          }

          if (
            matchedAvailability.before &&
            !isBefore(new Date(), parseISO(matchedAvailability.before))
          ) {
            throw 'Date range error array'
          }
        } else {
          if (
            (delivery?.availability.after
              ? !isAfter(chosenDate, parseISO(delivery?.availability.after))
              : true) &&
            (delivery?.availability.before
              ? !isBefore(chosenDate, parseISO(delivery?.availability.before))
              : true)
          ) {
            throw 'Date range error'
          }
        }
      }
    }
  }

  // Check subtotal
  const subtotal = sumBy(flatOrders, order => {
    return (order[`type${order.chosen.unit}Price`] ?? 0) * order.chosen.amount
  })
  if (!(subtotal === parseFloat(subtotal_amount))) {
    throw 'Subtotal not aligned'
  }

  // Check delivery
  if (orders.shipping?.length) {
    const rates = (
      await graphqlRequest<{
        shippingCollection: { items: Shipping[] }
      }>({
        context,
        query: gql`
          query Delivery($preview: Boolean) {
            shippingCollection(preview: $preview, limit: 1, where: { year: 2023 }) {
              items {
                rates
              }
            }
          }
        `
      })
    ).shippingCollection.items[0].rates

    const shippingRate = calShipping({
      rates,
      orders: [...(orders.pickup || []), ...orders.shipping],
      countryCode
    })
    if (!(shippingRate.fee === parseFloat(shipping_amount || ''))) {
      throw 'Shipping fee not aligned'
    }

    const shippingDate = orders.shipping.every(
      (val, i, arr) => val.chosen.delivery?.date === arr[0].chosen.delivery?.date
    )

    return {
      shipping_rate_data: {
        display_name: new Array(
          'PostNL',
          shippingDate && orders.shipping[0].chosen.delivery?.date
            ? formatDateForDisplay(orders.shipping[0].chosen.delivery?.date)
            : undefined
        )
          .filter(f => f)
          .join(' | '),
        type: 'fixed_amount',
        fixed_amount: {
          currency: 'eur',
          amount: shippingRate.fee * 10 * 10
        },
        metadata: { label: shippingRate.label, weight: shippingRate.weight }
      }
    }
  } else {
    return null
  }
}

const checkout = async ({
  context,
  content
}: {
  context: LoaderFunctionArgs['context']
  content: CheckoutContent
}) => {
  const env = getEnv(context)
  if (!env?.STRIPE_KEY_PRIVATE) {
    throw new Error('Missing stripe private key')
  }

  let shipping: ShippingOptions | null
  try {
    shipping = await verifyContentful({ context, content })
  } catch (error) {
    console.log('error', error)
    return data({ error })
  }

  const item = (order: CakeOrder) => {
    const amount = order.chosen.amount
    const price = order[`type${order.chosen.unit}Price`]
    const unit = order[`type${order.chosen.unit}Unit`]

    if (!amount || !price) return

    const name = new Array(
      order.name,
      order.chosen.delivery?.type
        ? order.chosen.delivery.date
          ? getReadableDeliveryDate(order)
          : { pickup: '🛍️', shipping: '📦' }[order.chosen.delivery.type]
        : content.pickup_date
          ? '🛍️'
          : undefined,
      order.chosen.cakeCustomizations
        ? order.chosen.cakeCustomizations
          .map(customization => {
            const type = customization[0]
            const value = order.cakeCustomizationsCollection?.items.filter(
              c => c?.type === customization[0]
            )
            if (!value) return
            return `${type}: ${customization[1] === -1
              ? `Custom "${customization[2]}"`
              : value[0]?.options[customization[1]]
              }`
          })
          .join(', ')
        : undefined,
      unit?.unit
    )
      .filter(f => f)
      .join(' | ')
    return {
      price_data: {
        currency: 'eur',
        unit_amount: price * 10 * 10,
        product_data: {
          name,
          description: name,
          images: [order.image?.url],
          ...(order[`type${order.chosen.unit}Stock`] !== undefined && {
            metadata: { contentful_id: order.sys.id, type: order.chosen.unit }
          })
        }
      },
      quantity: amount
    }
  }
  let line_items: any[] = []
  content.orders.pickup?.forEach(order => {
    line_items.push(item(order))
  })
  content.orders.shipping?.forEach(order => {
    line_items.push(item(order))
  })

  content.paperBag &&
    line_items.push({
      price_data: {
        currency: 'eur',
        unit_amount: 0.5 * 10 * 10,
        product_data: { name: 'Paper bag' }
      },
      quantity: 1
    })

  const sessionData = {
    payment_method_types: ['ideal', 'card', 'bancontact', 'giropay', 'eps'],
    mode: 'payment',
    line_items: line_items.filter(l => l),
    ...(shipping && {
      shipping_address_collection: {
        allowed_countries: [
          countryCode3To2[content.countryCode || 'NLD'] || 'NL'
        ]
      },
      shipping_options: [{ ...shipping }]
    }),
    locale: 'en',
    success_url: content.success_url + '/id/{CHECKOUT_SESSION_ID}',
    cancel_url: content.cancel_url,
    phone_number_collection: { enabled: true },
    ...(content.pickup_date && {
      payment_intent_data: {
        description: `🛍️ pickup date: ${content.pickup_date}`
      }
    }),
    metadata: {
      ...(content.notes && { Notes: content.notes }),
      ...(content.gift_card && { 'Gift card number': content.gift_card }),
      ...(content.birthday_cake_voucher && {
        'Birthday cake voucher': content.birthday_cake_voucher
      })
    },
    expires_at: Math.floor(Date.now() / 1000) + 31 * 60
  }

  const getPairs = (
    sessionData: Record<string, any>,
    keys: string[] = []
  ): [string[], any][] =>
    Object.entries(sessionData).reduce<[string[], any][]>((pairs, [key, value]) => {
      if (typeof value === 'object' && value !== null) {
        pairs.push(...getPairs(value, [...keys, key]))
      } else {
        pairs.push([[...keys, key], value])
      }
      return pairs
    }, [])
  const sessionDataPairs = getPairs(sessionData)
    .map(
      ([keys, value]) =>
        `${keys[0]}${keys
          .slice(1)
          .map(a => `[${a}]`)
          .join('')}=${value}`
    )
    .join('&')

  const body = new URLSearchParams(sessionDataPairs)
  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      ...getStripeHeaders(env.STRIPE_KEY_PRIVATE),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  })
  const result = await res.json()
  if ((result as any)?.error) {
    throw data((result as any).error, { status: 500 })
  }
  return result
}

export default checkout
