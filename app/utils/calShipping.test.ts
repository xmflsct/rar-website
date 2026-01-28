import { describe, it, expect } from 'vitest'
import calShipping from './calShipping'
import { Shipping } from './contentful'
import { CakeOrder } from '~/states/bag'

// Helper to create mock order
const createMockOrder = (
  overrides: Partial<CakeOrder> = {},
  chosenOverrides: Partial<CakeOrder['chosen']> = {}
): CakeOrder => {
  return {
    sys: { id: 'cake-1', publishedAt: '2023-01-01' },
    name: 'Test Cake',
    slug: 'test-cake',
    available: true,
    highlight: false,
    imagesCollection: { items: [] },
    chosen: {
      unit: 'A',
      amount: 1,
      delivery: { type: 'shipping' },
      ...chosenOverrides
    },
    typeAPrice: 10,
    shippingWeight: 100,
    ...overrides
  } as unknown as CakeOrder
}

const createMockRates = (rates: Shipping['rates'][0]['rates']): Shipping['rates'] => {
  return [
    {
        type: 'standard',
        countries: [{ code: 'NLD', name: 'Netherlands' }],
        rates: rates
    }
  ]
}

describe('calShipping', () => {
  it('should return default when no matching country rates', () => {
    const rates = createMockRates([])
    // countryCode defaults to 'NLD' in calShipping
    const result = calShipping({ rates, orders: [], countryCode: 'USA' })
    expect(result.fee).toBeUndefined()
  })

  it('should calculate shipping fee correctly for a matching rate', () => {
    const rates = createMockRates([
      { weight: { min: 0, max: 200 }, price: 5, label: true }
    ])
    const orders = [createMockOrder({ shippingWeight: 100 }, { amount: 1 })]
    // Weight = 100 * 1.05 * 1 = 105
    // 0 <= 105 <= 200 -> Matches

    const result = calShipping({ rates, orders, countryCode: 'NLD' })
    expect(result.fee).toBe(5)
    expect(result.weight).toBe(105)
  })

  it('should handle free shipping based on rate.freeAbove', () => {
    const rates = createMockRates([
      { weight: { min: 0, max: 200 }, price: 5, freeAbove: 50, label: true }
    ])
    // Order price 60 > 50
    const orders = [createMockOrder({ typeAPrice: 60, shippingWeight: 100 }, { amount: 1 })]

    const result = calShipping({ rates, orders, countryCode: 'NLD' })
    expect(result.fee).toBe(0)
  })

  it('should not apply free shipping if subtotal is below rate.freeAbove', () => {
    const rates = createMockRates([
      { weight: { min: 0, max: 200 }, price: 5, freeAbove: 50, label: true }
    ])
    // Order price 40 < 50
    const orders = [createMockOrder({ typeAPrice: 40, shippingWeight: 100 }, { amount: 1 })]

    const result = calShipping({ rates, orders, countryCode: 'NLD' })
    expect(result.fee).toBe(5)
  })

  it('should prioritize order delivery customization freeAbove over rate freeAbove', () => {
    const rates = createMockRates([
      { weight: { min: 0, max: 200 }, price: 5, freeAbove: 100, label: true }
    ])
    const orders = [
      createMockOrder(
        {
          typeAPrice: 60,
          shippingWeight: 100,
          deliveryCustomizations: {
            shipping: {
              freeAbove: 50, // This should take precedence
              availability: { after: '09:00', before: '17:00' }
            }
          }
        },
        { amount: 1 }
      )
    ]
    // Subtotal 60. rate.freeAbove 100 (would perform fee). order.freeAbove 50 (should be free).

    const result = calShipping({ rates, orders, countryCode: 'NLD' })
    expect(result.fee).toBe(0)
  })

  it('should use the largest freeAbove from orders', () => {
     const rates = createMockRates([
      { weight: { min: 0, max: 500 }, price: 5, label: true }
    ])
    // Order 1: freeAbove 50. Order 2: freeAbove 80.
    // Subtotal 60.
    // If we use 80, fee applies. If we use 50, fee 0.
    // Code sorts descending: b - a. So first is largest freeAbove.
    // So it picks 80. Subtotal 60 < 80 -> Fee applies.

    const orders = [
      createMockOrder(
        {
          typeAPrice: 30,
          deliveryCustomizations: { shipping: { freeAbove: 50, availability: { after: '', before: '' } } }
        }
      ),
      createMockOrder(
        {
          typeAPrice: 30,
          deliveryCustomizations: { shipping: { freeAbove: 80, availability: { after: '', before: '' } } }
        }
      )
    ]
    // Total 60. Max freeAbove 80. 60 < 80. Should pay.

    const result = calShipping({ rates, orders, countryCode: 'NLD' })
    expect(result.fee).toBe(5)

    // Test case where subtotal > max freeAbove
    // Order 3: price 30. Total 90. 90 >= 80. Free.
     const orders2 = [
      ...orders,
      createMockOrder({ typeAPrice: 30 })
    ]
    const result2 = calShipping({ rates, orders: orders2, countryCode: 'NLD' })
    expect(result2.fee).toBe(0)
  })

  it('should handle overlapping rates by picking the last one', () => {
    // Current implementation iterates all rates and updates fee/label if match.
    // So last matching rate wins.
    const rates = createMockRates([
      { weight: { min: 0, max: 200 }, price: 5, label: 'first' },
      { weight: { min: 0, max: 200 }, price: 10, label: 'second' }
    ])
    const orders = [createMockOrder({ shippingWeight: 100 }, { amount: 1 })]

    const result = calShipping({ rates, orders, countryCode: 'NLD' })
    expect(result.fee).toBe(10)
    expect(result.label).toBe('second')
  })
})
