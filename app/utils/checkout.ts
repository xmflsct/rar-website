import { json, LoaderArgs } from '@remix-run/cloudflare'
import { parseISO } from 'date-fns'
import { gql } from 'graphql-request'
import { sumBy } from 'lodash'
import { CakeOrder } from '~/states/bag'
import calShipping from './calShipping'
import { Cake, graphqlRequest, Shipping } from './contentful'

export type CheckoutContent = {
  ideal?: boolean
  cards?: boolean
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
    metadata?: { label?: boolean; weight: number }
  }
}

const verifyContentful = async ({
  context,
  content: { orders, subtotal_amount, shipping_amount }
}: {
  context: LoaderArgs['context']
  content: CheckoutContent
}): Promise<ShippingOptions | null> => {
  if ((!orders.pickup?.length && !orders.shipping?.length) || !subtotal_amount) {
    throw json('Submitted checkout content error', { status: 400 })
  }

  const flatOrders = [...(orders.pickup || []), ...(orders.shipping || [])]

  // Check cakes
  const tempIds: string[] = []
  let ids: string | undefined = undefined
  flatOrders?.forEach(order => tempIds.push(`"${order.sys.id}"`))
  tempIds.length && (ids = tempIds.join(','))

  if (ids?.length) {
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
            | 'deliveryCustomizations'
            | 'shippingWeight'
            | 'shippingAvailable'
          >[]
        }
      }>({
        context,
        variables: { ids },
        query: gql`
          query Cakes($preview: Boolean, $ids: String) {
            cakeCollection(preview: $preview, where: { sys: { id_in: [$ids] } }) {
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
                deliveryCustomizations
                shippingWeight
                shippingAvailable
              }
            }
          }
        `
      })
    ).cakeCollection.items

    for (const item of items) {
      const objectIndex = flatOrders.findIndex(i => i.sys.id === item.sys.id)

      if (objectIndex < 0) {
        throw json('Cake not found', { status: 400 })
      }

      if (!item.available) {
        throw json('Cake not available', { status: 400 })
      }

      const order = flatOrders[objectIndex]
      if (!item[`type${order.chosen.unit}Available`]) {
        throw json('Cake availability error', { status: 400 })
      }
      const stock = item[`type${order.chosen.unit}Stock`]
      if (stock && order.chosen.amount > stock) {
        throw json('Cake quantity exceeded', { status: 400 })
      }
      if (order.chosen.amount < (item[`type${order.chosen.unit}Minimum`] || 1)) {
        throw json('Cake quantity error', { status: 400 })
      }
      if (order[`type${order.chosen.unit}Price`] !== item[`type${order.chosen.unit}Price`]) {
        throw json('Cake pricing error', { status: 400 })
      }
    }
  }

  // Check subtotal
  const subtotal = sumBy(flatOrders, order => {
    return (order[`type${order.chosen.unit}Price`] ?? 0) * order.chosen.amount
  })
  if (!(subtotal === parseFloat(subtotal_amount))) {
    throw json('Subtotal not aligned', { status: 400 })
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
            shippingCollection(preview: $preview, limit: 1, where: { year: 2022 }) {
              items {
                rates
              }
            }
          }
        `
      })
    ).shippingCollection.items[0].rates

    const shippingRate = calShipping({ rates, orders: orders.shipping })
    if (!(shippingRate.fee === parseFloat(shipping_amount || ''))) {
      throw json('Shipping fee not aligned', { status: 400 })
    }

    const shippingDate = orders.shipping.every(
      (val, i, arr) => val.chosen.delivery?.date === arr[0].chosen.delivery?.date
    )

    return {
      shipping_rate_data: {
        display_name: new Array(
          'PostNL',
          shippingDate && orders.shipping[0].chosen.delivery?.date
            ? parseISO(orders.shipping[0].chosen.delivery?.date).toLocaleString('en-GB', {
                timeZone: 'Europe/Amsterdam',
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
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
  context: LoaderArgs['context']
  content: CheckoutContent
}) => {
  if (!context?.STRIPE_KEY_PRIVATE) {
    throw new Error('Missing stripe private key')
  }

  const shipping = await verifyContentful({ context, content })

  const item = (order: CakeOrder) => {
    const amount = order.chosen.amount
    const price = order[`type${order.chosen.unit}Price`]
    const unit = order[`type${order.chosen.unit}Unit`]

    if (!amount || !price) return

    const name = new Array(
      order.name,
      order.chosen.delivery?.type
        ? order.chosen.delivery.date
          ? `Special ${order.chosen.delivery.type}: ${parseISO(
              order.chosen.delivery.date
            ).toLocaleString('en-GB', {
              timeZone: 'Europe/Amsterdam',
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}`
          : { pickup: '🛍️', shipping: '📦' }[order.chosen.delivery.type]
        : content.pickup_date
        ? '🛍️'
        : undefined,
      order.chosen.cakeCustomizations
        ? order.chosen.cakeCustomizations
            .map(customization => {
              const type = customization[0]
              const value = order.cakeCustomizationsCollection?.items.filter(
                c => c.type === customization[0]
              )
              if (!value) return
              return `${type}: ${value[0].options[customization[1]]}`
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

  line_items.push({
    price_data: {
      currency: 'eur',
      unit_amount: content.ideal ? 0.3 * 10 * 10 : 1 * 10 * 10,
      product_data: { name: 'Processing fee' }
    },
    quantity: 1
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
    payment_method_types: content.ideal
      ? ['ideal', 'bancontact']
      : ['card', 'bancontact', 'giropay', 'sofort'],
    mode: 'payment',
    line_items: line_items.filter(l => l),
    ...(shipping && {
      shipping_address_collection: {
        allowed_countries: ['NL']
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

  // @ts-ignore
  const getPairs = (sessionData, keys = []) =>
    Object.entries(sessionData).reduce((pairs, [key, value]) => {
      if (typeof value === 'object')
        // @ts-ignore
        pairs.push(...getPairs(value, [...keys, key]))
      // @ts-ignore
      else pairs.push([[...keys, key], value])
      return pairs
    }, [])
  const data = getPairs(sessionData)
    .map(
      // @ts-ignore
      ([[key0, ...keysRest], value]) => `${key0}${keysRest.map(a => `[${a}]`).join('')}=${value}`
    )
    .join('&')

  const body = new URLSearchParams(data)
  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${context.STRIPE_KEY_PRIVATE}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  })
  const result = await res.json()
  if ((result as any)?.error) {
    throw json((result as any).error, { status: 500 })
  }
  return result
}

export default checkout
