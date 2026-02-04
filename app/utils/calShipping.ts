import { CakeOrder } from '~/states/bag'
import { Shipping } from './contentful'

type Props = {
  rates: Shipping['rates']
  orders: CakeOrder[]
  countryCode?: string
}

const calShipping = ({
  rates,
  orders,
  countryCode = 'NLD'
}: Props): { fee?: number; weight: number; label?: 'true' | 'false' } => {
  let subtotal = 0
  let weight = 0
  for (const order of orders) {
    subtotal = subtotal + (order[`type${order.chosen.unit}Price`] ?? 0) * order.chosen.amount
    if (order.chosen.delivery?.type === 'shipping') {
      weight = weight + (order.shippingWeight || 0) * 1.05 * order.chosen.amount
    }
  }

  const DEFAULT = { fee: undefined, weight, label: 'true' } as const

  const countryMatchedRate = rates.filter(s => s.countries.some(country => country.code === countryCode))
  if (countryMatchedRate.length !== 1) {
    return DEFAULT
  }

  let label = undefined
  let fee = undefined

  const orderFreeAbove = orders
    .filter(order => order.deliveryCustomizations?.shipping?.freeAbove)
    .sort(
      (a, b) =>
        (b.deliveryCustomizations?.shipping?.freeAbove || 0) -
        (a.deliveryCustomizations?.shipping?.freeAbove || 0)
    )[0]

  for (const rate of countryMatchedRate[0]!.rates) {
    if (rate.weight.min <= weight && weight <= rate.weight.max) {
      if (orderFreeAbove?.deliveryCustomizations?.shipping?.freeAbove) {
        fee =
          subtotal >= orderFreeAbove.deliveryCustomizations?.shipping?.freeAbove ? 0 : rate.price
      } else if (rate.freeAbove) {
        fee = subtotal >= rate.freeAbove ? 0 : rate.price
      } else {
        fee = rate.price
      }
      label =
        typeof rate.label === 'boolean' ? (rate.label.toString() as 'true' | 'false') : rate.label
    }
  }

  return fee !== undefined ? { fee, weight, label } : DEFAULT
}

export default calShipping
