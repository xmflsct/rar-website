import type { LoaderFunctionArgs } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { CakeOrder } from '~/states/bag'

const graphqlRequest = vi.hoisted(() => vi.fn())
vi.mock('./contentful', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./contentful')>()),
  graphqlRequest
}))

import { type CheckoutContent, getPairs, verifyContentful } from './checkout'

describe('getPairs', () => {
  it('should flatten a simple object', () => {
    expect(getPairs({ a: 1, b: 'test' })).toEqual([
      [['a'], 1],
      [['b'], 'test']
    ])
  })

  it('should flatten nested objects', () => {
    expect(getPairs({ a: { b: 2 } })).toEqual([[['a', 'b'], 2]])
  })

  it('should flatten arrays', () => {
    expect(getPairs({ arr: [1, 2] })).toEqual([
      [['arr', '0'], 1],
      [['arr', '1'], 2]
    ])
  })

  it('should flatten mixed nested structures', () => {
    const result = getPairs({ a: 1, b: { c: [3, { d: 4 }] } })
    expect(result).toEqual(expect.arrayContaining([
      [['a'], 1],
      [['b', 'c', '0'], 3],
      [['b', 'c', '1', 'd'], 4]
    ]))
    expect(result).toHaveLength(3)
  })

  it('should handle null values as primitives', () => {
    expect(getPairs({ a: null, b: { c: null } })).toEqual([
      [['a'], null],
      [['b', 'c'], null]
    ])
  })

  it('should preserve false values', () => {
    expect(getPairs({ adaptive_pricing: { enabled: false } })).toEqual([
      [['adaptive_pricing', 'enabled'], false]
    ])
  })
})

const cake = {
  sys: { id: 'full-moon-2026' },
  available: true,
  typeAAvailable: true,
  typeAPrice: 32,
  typeAStock: 3,
  typeAMinimum: 1,
  shippingWeight: 350,
  shippingAvailable: true,
  deliveryCustomizations: {
    shipping: {
      freeAbove: 95,
      availability: [{ date: '2026-09-04', before: '2026-09-01' }]
    }
  }
}
const rates = [{
  type: 'PostNL',
  countries: [{ code: 'NLD', name: 'Netherlands' }],
  rates: [{ weight: { min: 0, max: 5000 }, price: 7, label: true }]
}]
const order = {
  ...cake,
  name: 'Happy Full Moon Box',
  chosen: {
    unit: 'A',
    amount: 1,
    delivery: { type: 'shipping', date: '2026-09-04' }
  }
} as unknown as CakeOrder
const content = (): CheckoutContent => ({
  countryCode: 'NLD',
  orders: { shipping: [structuredClone(order)] },
  subtotal_amount: '32',
  shipping_amount: '7'
})

describe('Full Moon Box checkout validation', () => {
  beforeEach(() => {
    vi.setSystemTime('2026-08-17T12:00:00Z')
    graphqlRequest.mockReset().mockResolvedValue({
      cakeCollection: { items: [cake] },
      shippingCollection: { items: [{ rates }] }
    })
  })
  afterEach(() => vi.useRealTimers())

  it('accepts the CMS price, quantity, date and shipping fee', async () => {
    await expect(verifyContentful({
      context: {} as LoaderFunctionArgs['context'],
      content: content()
    })).resolves.toMatchObject({
      shipping_rate_data: { fixed_amount: { amount: 700 }, metadata: { label: 'true' } }
    })
  })

  it.each([
    ['missing date', (value: CheckoutContent) => { delete value.orders.shipping![0]!.chosen.delivery!.date }, 'Delivery date is required'],
    ['missing delivery', (value: CheckoutContent) => { delete value.orders.shipping![0]!.chosen.delivery }, 'Delivery date is required'],
    ['price', (value: CheckoutContent) => { value.orders.shipping![0]!.typeAPrice = 1 }, 'Cake pricing error'],
    ['quantity', (value: CheckoutContent) => { value.orders.shipping![0]!.chosen.amount = 4 }, 'Cake quantity exceeded'],
    ['date', (value: CheckoutContent) => { value.orders.shipping![0]!.chosen.delivery!.date = '2026-09-05' }, 'Chosen date not exist'],
    ['shipping fee', (value: CheckoutContent) => { value.shipping_amount = '0' }, 'Shipping fee not aligned']
  ])('rejects a tampered %s', async (_name, tamper, error) => {
    const value = content()
    tamper(value)
    await expect(verifyContentful({
      context: {} as LoaderFunctionArgs['context'],
      content: value
    })).rejects.toBe(error)
  })

  it('rejects an available date after its order cutoff', async () => {
    vi.setSystemTime('2026-09-01T00:00:00Z')
    await expect(verifyContentful({
      context: {} as LoaderFunctionArgs['context'],
      content: content()
    })).rejects.toBe('Date range error array')
  })
})
