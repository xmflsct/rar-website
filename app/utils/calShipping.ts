import { CakeOrder } from '~/states/bag'
import { Shipping } from './contentful'

type Props = {
  rates: Shipping['rates']
  orders: CakeOrder[]
}

const calShipping = ({ rates, orders }: Props): { fee: number; weight: number, label?: boolean; } => {
  let subtotal = 0
  let weight = 0
  for (const order of orders) {
    if (order.chosen.delivery?.type === 'shipping') {
      subtotal = subtotal + (order.typeAPrice || 0) * (order.chosen.typeAAmount || 0) +
        (order.typeBPrice || 0) * (order.chosen.typeBAmount || 0) +
        (order.typeCPrice || 0) * (order.chosen.typeCAmount || 0)

      weight = weight +
        (order.shippingWeight || 0) *
        1.05 *
        ((order.chosen.typeAAmount || 0) +
          (order.chosen.typeBAmount || 0) +
          (order.chosen.typeCAmount || 0))
    }
  }

  const DEFAULT = { fee: 6.75, weight, label: true }

  const shippingNL = rates.filter(s => s.type === 'Netherlands')
  if (shippingNL.length !== 1) {
    return DEFAULT
  }

  let label = undefined
  let fee = undefined
  for (const rate of shippingNL[0].rates) {
    if (
      rate.weight.min <= weight &&
      weight <= rate.weight.max
    ) {
      fee = rate.freeAbove && subtotal >= rate.freeAbove ? 0 : rate.price
      label = rate.label
    }
  }

  return fee !== undefined ? { fee, weight, label } : DEFAULT
}

export default calShipping
