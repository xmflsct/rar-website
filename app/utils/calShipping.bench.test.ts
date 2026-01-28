import { describe, test } from 'vitest'
import calShipping from './calShipping'
import { Shipping } from './contentful'
import { CakeOrder } from '~/states/bag'

// Helper to create mock orders
const createMockOrders = (count: number): CakeOrder[] => {
  return Array.from({ length: count }).map((_, i) => ({
    sys: { id: `cake-${i}`, publishedAt: '2023-01-01' },
    name: `Cake ${i}`,
    slug: `cake-${i}`,
    available: true,
    highlight: false,
    imagesCollection: { items: [] },
    chosen: {
      unit: 'A',
      amount: 1,
      delivery: { type: 'shipping' }
    },
    typeAPrice: 10,
    shippingWeight: 100,
    deliveryCustomizations: {
        shipping: {
            freeAbove: i % 2 === 0 ? 50 + i : undefined,
            availability: { after: '09:00', before: '17:00' }
        }
    }
  } as unknown as CakeOrder))
}

// Helper to create mock rates
const createMockRates = (rateCount: number): Shipping['rates'] => {
  // Create rates that ALL match the weight.
  const rates = Array.from({ length: rateCount }).map((_, i) => ({
    weight: { min: 0, max: 1000000 },
    price: 5 + i,
    label: true
  }))
  return [
    {
        type: 'standard',
        countries: [{ code: 'NLD', name: 'Netherlands' }],
        rates: rates
    }
  ]
}

describe('calShipping Performance', () => {
    test('benchmark redundant calculation', () => {
        const orderCount = 100
        const rateCount = 2000
        const iterations = 100

        const orders = createMockOrders(orderCount)
        const rates = createMockRates(rateCount)

        const start = performance.now()
        for (let i = 0; i < iterations; i++) {
            calShipping({ rates, orders, countryCode: 'NLD' })
        }
        const end = performance.now()
        console.log(`\n--- BENCHMARK RESULTS ---`)
        console.log(`Orders: ${orderCount}, Rates: ${rateCount}, Iterations: ${iterations}`)
        console.log(`Total Execution time: ${(end - start).toFixed(2)} ms`)
        console.log(`Average time per call: ${((end - start) / iterations).toFixed(4)} ms`)
        console.log(`-------------------------\n`)
    })
})
