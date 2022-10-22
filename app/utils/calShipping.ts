import { maxBy } from 'lodash'
import { CakeOrder } from '~/states/bag'
import { Shipping } from './contentful'

type Props = {
  rates: Shipping['rates']
  orders: CakeOrder[]
}

const calShipping = ({ rates, orders }: Props): { fee: number; weight: number, label?: boolean; } => {
  const DEFAULT = { fee: 10, weight: 500, label: true }

  const shippingNL = rates.filter(s => s.type === 'Netherlands')
  if (shippingNL.length !== 1) {
    return DEFAULT
  }

  const shippingFees: ({ fee: number; weight: number; label?: boolean } | undefined)[] =
    orders.map(order => {
      if (order.chosen.delivery?.type === 'shipping') {
        let fee = 0
        let label: boolean | undefined
        const freeAbove = order.deliveryCustomizations?.shipping?.freeAbove
        const subtotalShipping =
          (order.typeAPrice || 0) * (order.chosen.typeAAmount || 0) +
          (order.typeBPrice || 0) * (order.chosen.typeBAmount || 0) +
          (order.typeCPrice || 0) * (order.chosen.typeCAmount || 0)
        const totalWeight =
          (order.shippingWeight || 0) *
          1.05 *
          ((order.chosen.typeAAmount || 0) +
            (order.chosen.typeBAmount || 0) +
            (order.chosen.typeCAmount || 0))

        shippingNL[0].rates.forEach(rate => {
          if (
            rate.weight.min <= totalWeight &&
            totalWeight <= rate.weight.max
          ) {
            fee = freeAbove && subtotalShipping >= freeAbove ? 0 : rate.price
            label = rate.label
          }
        })
        return { fee, weight: totalWeight, label }
      }
    })

  const max = maxBy(shippingFees, s => s?.weight)
  return max || DEFAULT
}

export default calShipping
