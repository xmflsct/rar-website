import { describe, expect, it } from 'vitest'
import type { CakeOrder } from '~/states/bag'
import type { Shipping } from './contentful'
import calShipping from './calShipping'

const rates: Shipping['rates'] = [
  {
    type: 'PostNL',
    countries: [{ code: 'NLD', name: 'Netherlands' }],
    rates: [{ weight: { min: 0, max: 5000 }, price: 7, label: true }]
  },
  {
    type: 'PostNL',
    countries: [{ code: 'DEU', name: 'Germany' }],
    rates: [{ weight: { min: 0, max: 5000 }, price: 9, label: true }]
  }
]

const fullMoonBoxes = (amount: number) =>
  ({
    typeAPrice: 32,
    shippingWeight: 350,
    deliveryCustomizations: { shipping: { freeAbove: 95 } },
    chosen: { unit: 'A', amount, delivery: { type: 'shipping' } }
  }) as CakeOrder

describe('Full Moon Box shipping', () => {
  it('charges NL shipping below the three-box threshold', () => {
    expect(calShipping({ rates, orders: [fullMoonBoxes(1)] })).toEqual({
      fee: 7,
      weight: 367.5,
      label: 'true'
    })
  })

  it('keeps the shipment label when three boxes qualify for free shipping', () => {
    expect(calShipping({ rates, orders: [fullMoonBoxes(3)] })).toEqual({
      fee: 0,
      weight: 1102.5,
      label: 'true'
    })
  })

  it('applies the EU fee and the same product-level free-shipping threshold', () => {
    expect(calShipping({ rates, orders: [fullMoonBoxes(1)], countryCode: 'DEU' }).fee).toBe(9)
    expect(calShipping({ rates, orders: [fullMoonBoxes(3)], countryCode: 'DEU' })).toEqual({
      fee: 0,
      weight: 1102.5,
      label: 'true'
    })
  })
})
