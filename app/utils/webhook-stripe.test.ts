import type { LoaderFunctionArgs } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const postShipments = vi.hoisted(() => vi.fn())
vi.mock('@myparcel/sdk', () => ({
  FetchClient: class {},
  PostShipments: class {},
  createPrivateSdk: () => ({ postShipments })
}))

import { createShipment } from '../routes/webhook.stripe'

const context = {
  get: () => ({
    env: {
      STRIPE_KEY_ADMIN_PREVIEW: 'sk_preview',
      WEBHOOK_STRIPE_MYPARCEL_KEY_PREVIEW: 'mp_preview'
    },
    ctx: {}
  })
} as unknown as LoaderFunctionArgs['context']

describe('shipment creation', () => {
  beforeEach(() => postShipments.mockReset())
  afterEach(() => vi.unstubAllGlobals())

  it('reuses the Stripe shipment ID when the same order is retried', async () => {
    let shippingId: string | undefined
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      if (init?.method === 'POST') {
        shippingId = new URLSearchParams(init.body as string).get('metadata[shipping_id]')!
        return new Response('{}')
      }
      return Response.json({ metadata: shippingId ? { shipping_id: shippingId } : {} })
    })
    vi.stubGlobal('fetch', fetchMock)
    postShipments.mockResolvedValue([{ id: '238779229' }])

    const input = {
      context,
      request: new Request('http://localhost/webhook/stripe'),
      customer_details: {} as never,
      payment_intent: 'pi_full_moon'
    }

    await expect(createShipment(input)).resolves.toEqual({ ok: true, id: '238779229' })
    await expect(createShipment(input)).resolves.toEqual({ ok: true, id: '238779229' })
    expect(postShipments).toHaveBeenCalledTimes(1)
  })
})
