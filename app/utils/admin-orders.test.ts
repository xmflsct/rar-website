import type { LoaderFunctionArgs } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const createShipmentMock = vi.hoisted(() => vi.fn())
vi.mock('../routes/webhook.stripe', () => ({ createShipment: createShipmentMock }))

import {
  action,
  getNextOrdersUrl,
  loadOrders,
  loader,
  normalizeShipmentIds
} from '../routes/admin.orders'
import { loader as shippingLabelLoader } from '../routes/admin.shipping-label.$id'

const NOW = 2_000_000_000
const SINCE = NOW - 60 * 60 * 24 * 30
const environment = {
  STRIPE_KEY_ADMIN: 'sk_live',
  STRIPE_KEY_ADMIN_PREVIEW: 'sk_preview',
  WEBHOOK_STRIPE_MYPARCEL_KEY: 'mp_live',
  WEBHOOK_STRIPE_MYPARCEL_KEY_PREVIEW: 'mp_preview'
}

const context = (overrides: Record<string, string> = {}) =>
  ({
    get: () => ({ env: { ...environment, ...overrides }, ctx: {} })
  }) as unknown as LoaderFunctionArgs['context']

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })

const unwrap = <T>(result: unknown) => result as { data: T; init: ResponseInit | null }

const requestedUrl = (input: RequestInfo | URL) =>
  new URL(input instanceof Request ? input.url : input.toString())

const lineItem = (id: string, description = `Cake ${id}`, quantity = 1) => ({
  id,
  description,
  quantity
})

type SessionOptions = {
  id: string
  paymentStatus?: 'paid' | 'unpaid'
  paymentIntentStatus?: string
  created?: number
  lineItems?: ReturnType<typeof lineItem>[]
  hasMoreLineItems?: boolean
  labelRequired?: boolean
  shipmentId?: string
  shipping?: boolean
}

const checkoutSession = ({
  id,
  paymentStatus = 'paid',
  paymentIntentStatus = 'succeeded',
  created = NOW - 60,
  lineItems = [lineItem(`li_${id}`)],
  hasMoreLineItems = false,
  labelRequired = true,
  shipmentId = '901',
  shipping = true
}: SessionOptions) => ({
  id,
  status: 'complete',
  payment_status: paymentStatus,
  customer_details: {
    name: `Customer ${id}`,
    phone: '0612345678',
    email: `${id}@example.com`,
    address: {
      country: 'NL',
      city: 'Rotterdam',
      postal_code: '3011PG',
      line1: 'Hoogstraat 55A',
      line2: null
    }
  },
  payment_intent: {
    id: `pi_${id}`,
    status: paymentIntentStatus,
    created,
    metadata: shipmentId ? { shipping_id: shipmentId } : {},
    latest_charge: {
      id: `ch_${id}`,
      created,
      receipt_number: `receipt_${id}`,
      billing_details: { name: `Billing ${id}` },
      description: '🛍️ pickup date: Friday',
      metadata: { chargeNote: 'charge', shared: 'charge' },
      shipping: shipping
        ? {
            name: `Customer ${id}`,
            address: {
              country: 'NL',
              city: 'Rotterdam',
              postal_code: '3011PG',
              line1: 'Hoogstraat 55A',
              line2: null,
              state: null
            },
            carrier: null,
            phone: '0612345678',
            tracking_number: null
          }
        : null
    }
  },
  line_items: { data: lineItems, has_more: hasMoreLineItems },
  shipping_cost: {
    shipping_rate: { metadata: { label: labelRequired ? 'true' : 'false' } }
  },
  metadata: { sessionNote: 'session', shared: 'session' }
})

const load = (
  fetchMock: ReturnType<typeof vi.fn>,
  options: Parameters<typeof loadOrders>[2] = { since: SINCE, until: NOW },
  request = new Request('https://roundandround.nl/admin/orders')
) => {
  vi.stubGlobal('fetch', fetchMock)
  return loadOrders(context(), request, options)
}

beforeEach(() => {
  createShipmentMock.mockReset()
  vi.useFakeTimers()
  vi.setSystemTime(NOW * 1000)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('admin order completeness', () => {
  it('preserves every displayed field and filters only non-order line items', async () => {
    const session = checkoutSession({
      id: 'cs_live_complete',
      lineItems: [
        lineItem('cake', 'Chocolate cake', 2),
        lineItem('shipping', 'Gift Card Shipping | Shipment'),
        lineItem('transaction', 'Transaction fee'),
        lineItem('processing', 'Processing fee'),
        lineItem('pickup', 'Pick up: Friday')
      ]
    })
    const fetchMock = vi.fn().mockResolvedValue(json({ data: [session], has_more: false }))

    const result = await load(fetchMock)

    expect(result).toEqual({
      type: 'orders',
      ok: true,
      orders: [
        {
          id: 'cs_live_complete',
          receipt: 'receipt_cs_live_complete',
          name: 'Billing cs_live_complete',
          phone: '0612345678',
          email: 'cs_live_complete@example.com',
          pickup: '🛍️ pickup date: Friday',
          shipping: {
            shipping: session.payment_intent.latest_charge.shipping,
            labelRequired: true,
            shipmentId: '901',
            sessionId: 'cs_live_complete'
          },
          items: [lineItem('cake', 'Chocolate cake', 2)],
          metadata: {
            chargeNote: 'charge',
            sessionNote: 'session',
            shared: 'session'
          }
        }
      ],
      hasMore: false,
      nextCursor: 'cs_live_complete',
      since: SINCE,
      until: NOW
    })

    const [input, init] = fetchMock.mock.calls[0] as [RequestInfo | URL, RequestInit]
    const url = requestedUrl(input)
    expect(url.searchParams.get('created[gte]')).toBe(SINCE.toString())
    expect(url.searchParams.get('created[lte]')).toBe(NOW.toString())
    expect(url.searchParams.get('limit')).toBe('25')
    expect(init.headers).toMatchObject({ Authorization: 'Bearer sk_live' })
  })

  it('keeps orders with missing optional fields instead of dropping the row', async () => {
    const session = checkoutSession({
      id: 'cs_optional_fields',
      shipmentId: '',
      shipping: false
    })
    Object.assign(session.customer_details, { phone: null, email: null })
    Object.assign(session.payment_intent.latest_charge, {
      receipt_number: null,
      billing_details: { name: null },
      description: null,
      metadata: { 'Pick-up date': 'Saturday' }
    })
    const fetchMock = vi.fn().mockResolvedValue(json({ data: [session], has_more: false }))

    const result = await load(fetchMock)
    if (!result.ok) throw new Error(result.error)

    expect(result.orders).toHaveLength(1)
    expect(result.orders[0]).toMatchObject({
      id: 'cs_optional_fields',
      receipt: null,
      name: null,
      phone: 'NOT EXIST',
      email: null,
      pickup: 'Saturday',
      shipping: {
        shipping: null,
        shipmentId: undefined
      }
    })
  })

  it('uses Checkout payment status as the sole paid-order filter', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      json({
        data: [
          checkoutSession({
            id: 'cs_paid',
            paymentStatus: 'paid',
            paymentIntentStatus: 'processing',
            created: NOW + 1
          }),
          checkoutSession({
            id: 'cs_unpaid',
            paymentStatus: 'unpaid',
            paymentIntentStatus: 'succeeded'
          })
        ],
        has_more: false
      })
    )

    const result = await load(fetchMock)
    if (!result.ok) throw new Error(result.error)

    expect(result.orders.map((order) => order.id)).toEqual(['cs_paid'])
  })

  it('skips fully filtered Stripe pages without skipping later paid orders', async () => {
    const pages = new Map<string, unknown>([
      [
        '',
        {
          data: [
            checkoutSession({ id: 'cs_failed_1', paymentStatus: 'unpaid' }),
            checkoutSession({ id: 'cs_failed_2', paymentStatus: 'unpaid' })
          ],
          has_more: true
        }
      ],
      [
        'cs_failed_2',
        {
          data: [checkoutSession({ id: 'cs_paid_1' }), checkoutSession({ id: 'cs_paid_2' })],
          has_more: true
        }
      ],
      [
        'cs_paid_2',
        {
          data: [checkoutSession({ id: 'cs_paid_3' })],
          has_more: false
        }
      ]
    ])
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = requestedUrl(input)
      return json(pages.get(url.searchParams.get('starting_after') || ''))
    })

    const first = await load(fetchMock)
    const second = await load(fetchMock, {
      cursor: first.ok ? first.nextCursor : undefined,
      since: SINCE,
      until: NOW
    })
    if (!first.ok || !second.ok) throw new Error('Expected successful order pages')

    const ids = [...first.orders, ...second.orders].map((order) => order.id)
    expect(ids).toEqual(['cs_paid_1', 'cs_paid_2', 'cs_paid_3'])
    expect(new Set(ids).size).toBe(ids.length)
    expect(fetchMock).toHaveBeenCalledTimes(3)

    for (const [input] of fetchMock.mock.calls as [RequestInfo | URL][]) {
      const url = requestedUrl(input)
      expect(url.searchParams.get('created[gte]')).toBe(SINCE.toString())
      expect(url.searchParams.get('created[lte]')).toBe(NOW.toString())
    }
  })

  it('returns every paid order exactly once across full and partial Stripe pages', async () => {
    const sessions = Array.from({ length: 61 }, (_, index) =>
      checkoutSession({
        id: `cs_page_${String(index).padStart(2, '0')}`,
        paymentStatus: index % 4 === 0 ? 'unpaid' : 'paid',
        created: NOW - index
      })
    )
    const firstPage = sessions.slice(0, 25)
    const secondPage = sessions.slice(25, 50)
    const finalPage = sessions.slice(50)
    const pageByCursor = new Map<string, typeof firstPage>([
      ['', firstPage],
      [firstPage.at(-1)!.id, secondPage],
      [secondPage.at(-1)!.id, finalPage]
    ])
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = requestedUrl(input)
      const page = pageByCursor.get(url.searchParams.get('starting_after') || '') || []
      return json({ data: page, has_more: page !== finalPage })
    })

    const received: string[] = []
    let cursor: string | undefined
    let hasMore = true
    while (hasMore) {
      const result = await load(fetchMock, { cursor, since: SINCE, until: NOW })
      if (!result.ok) throw new Error(result.error)
      received.push(...result.orders.map((order) => order.id))
      cursor = result.nextCursor
      hasMore = result.hasMore
    }

    const expected = sessions
      .filter((session) => session.payment_status === 'paid')
      .map((session) => session.id)
    expect(received).toEqual(expected)
    expect(new Set(received).size).toBe(received.length)
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('uses the small page only on preview hosts', async () => {
    const fetchMock = vi.fn().mockImplementation(() =>
      Promise.resolve(
        json({ data: [checkoutSession({ id: 'cs_page_size' })], has_more: false })
      )
    )

    await load(
      fetchMock,
      { since: SINCE, until: NOW },
      new Request('http://localhost/admin/orders?pageSize=2')
    )
    expect(requestedUrl(fetchMock.mock.calls[0]?.[0]).searchParams.get('limit')).toBe('2')

    fetchMock.mockClear()
    await load(
      fetchMock,
      { since: SINCE, until: NOW },
      new Request('https://roundandround.nl/admin/orders?pageSize=2')
    )
    expect(requestedUrl(fetchMock.mock.calls[0]?.[0]).searchParams.get('limit')).toBe('25')
  })

  it('retrieves every line item until Stripe reports the end', async () => {
    const firstItem = lineItem('li_000')
    const middleItems = Array.from({ length: 100 }, (_, index) =>
      lineItem(`li_${String(index + 1).padStart(3, '0')}`)
    )
    const finalItems = Array.from({ length: 10 }, (_, index) => lineItem(`li_${index + 101}`))
    const session = checkoutSession({
      id: 'cs_many_items',
      lineItems: [firstItem],
      hasMoreLineItems: true
    })
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = requestedUrl(input)
      if (!url.pathname.endsWith('/line_items')) {
        return json({ data: [session], has_more: false })
      }
      const cursor = url.searchParams.get('starting_after')
      if (cursor === 'li_000') return json({ data: middleItems, has_more: true })
      if (cursor === 'li_100') return json({ data: finalItems, has_more: false })
      return json({ error: 'unexpected cursor' }, 400)
    })

    const result = await load(fetchMock)
    if (!result.ok) throw new Error(result.error)

    expect(result.orders[0]?.items).toHaveLength(111)
    expect(result.orders[0]?.items?.map((item) => item.id)).toEqual([
      firstItem.id,
      ...middleItems.map((item) => item.id),
      ...finalItems.map((item) => item.id)
    ])
  })

  it('fails instead of silently returning partial line items', async () => {
    const session = checkoutSession({
      id: 'cs_partial',
      lineItems: [lineItem('li_first')],
      hasMoreLineItems: true
    })
    const fetchMock = vi.fn(async (input: RequestInfo | URL) =>
      requestedUrl(input).pathname.endsWith('/line_items')
        ? json({ error: 'Stripe unavailable' }, 503)
        : json({ data: [session], has_more: false })
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = unwrap<{ type: 'orders'; ok: false; error: string }>(
      await loader({
        context: context(),
        params: {},
        request: new Request('https://roundandround.nl/admin/orders'),
        url: new URL('https://roundandround.nl/admin/orders'),
        pattern: ''
      })
    )

    expect(result.data).toEqual({
      type: 'orders',
      ok: false,
      error: 'Unable to load orders'
    })
    expect(result.init?.status).toBe(502)
    expect(result.init?.headers).toEqual({ 'Cache-Control': 'private, no-store' })
    expect(
      requestedUrl(fetchMock.mock.calls[0]?.[0] as RequestInfo | URL).searchParams.get(
        'created[gte]'
      )
    ).toBe(SINCE.toString())
  })

  it('rejects a Stripe cursor that does not advance', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      json({
        data: [checkoutSession({ id: 'same_cursor', paymentStatus: 'unpaid' })],
        has_more: true
      })
    )

    await expect(
      load(fetchMock, { cursor: 'same_cursor', since: SINCE, until: NOW })
    ).rejects.toThrow('Stripe order pagination did not advance')
  })

  it('keeps the initial snapshot window on later loader pages', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(json({ data: [checkoutSession({ id: 'cs_snapshot' })], has_more: false }))
    vi.stubGlobal('fetch', fetchMock)

    const result = unwrap<{
      type: 'orders'
      ok: true
      since: number
      until: number
    }>(
      await loader({
        context: context(),
        params: {},
        request: new Request(
          `https://roundandround.nl/admin/orders?cursor=previous&since=${SINCE}&until=${NOW}`
        ),
        url: new URL(
          `https://roundandround.nl/admin/orders?cursor=previous&since=${SINCE}&until=${NOW}`
        ),
        pattern: ''
      })
    )

    expect(result.data.since).toBe(SINCE)
    expect(result.data.until).toBe(NOW)
    const url = requestedUrl(fetchMock.mock.calls[0]?.[0] as RequestInfo | URL)
    expect(url.searchParams.get('starting_after')).toBe('previous')
    expect(url.searchParams.get('created[gte]')).toBe(SINCE.toString())
    expect(url.searchParams.get('created[lte]')).toBe(NOW.toString())
  })

  it('carries the snapshot window into the browser load-more request', () => {
    const url = new URL(
      getNextOrdersUrl('cs_cursor', SINCE, NOW, 2),
      'https://roundandround.nl'
    )

    expect(url.pathname).toBe('/admin/orders')
    expect(url.searchParams.get('cursor')).toBe('cs_cursor')
    expect(url.searchParams.get('since')).toBe(SINCE.toString())
    expect(url.searchParams.get('until')).toBe(NOW.toString())
    expect(url.searchParams.get('pageSize')).toBe('2')
  })
})

describe('server-side tracking proxy', () => {
  it('deduplicates IDs, rejects invalid IDs, and keeps the preview credential server-side', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      json({
        data: {
          tracktraces: [
            { shipment_id: 12, description: 'Delivered' },
            { shipment_id: 34, description: 'Registered' }
          ]
        }
      })
    )
    vi.stubGlobal('fetch', fetchMock)

    const result = unwrap<{
      type: 'trackings'
      ok: true
      trackings: Record<string, { description: string }>
    }>(
      await loader({
        context: context(),
        params: {},
        request: new Request(
          'http://localhost/admin/orders?trackingId=12&trackingId=invalid&trackingId=12&trackingId=34'
        ),
        url: new URL(
          'http://localhost/admin/orders?trackingId=12&trackingId=invalid&trackingId=12&trackingId=34'
        ),
        pattern: ''
      })
    )

    expect(result.data.trackings).toEqual({
      '12': { shipment_id: 12, description: 'Delivered' },
      '34': { shipment_id: 34, description: 'Registered' }
    })
    const [input, init] = fetchMock.mock.calls[0] as [RequestInfo | URL, RequestInit]
    expect(requestedUrl(input).pathname.endsWith('/tracktraces/12;34')).toBe(true)
    expect(init.headers).toEqual({
      Authorization: `bearer ${btoa('mp_preview')}`
    })
    expect(result.init?.headers).toEqual({ 'Cache-Control': 'private, no-store' })
  })

  it('returns an explicit tracking error without affecting order data', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ error: 'down' }, 503)))

    const result = unwrap<{ type: 'trackings'; ok: false; error: string }>(
      await loader({
        context: context(),
        params: {},
        request: new Request('https://roundandround.nl/admin/orders?trackingId=12'),
        url: new URL('https://roundandround.nl/admin/orders?trackingId=12'),
        pattern: ''
      })
    )

    expect(result.data).toEqual({
      type: 'trackings',
      ok: false,
      error: 'Unable to load shipping statuses'
    })
    expect(result.init?.status).toBe(502)
  })

  it('normalizes shipment IDs within the server request limit', () => {
    const ids = [
      '123',
      'invalid',
      '123',
      ...Array.from({ length: 101 }, (_, index) => `${index + 1000}`)
    ]

    const result = normalizeShipmentIds(ids)

    expect(result).toHaveLength(100)
    expect(result.slice(0, 3)).toEqual(['123', '1000', '1001'])
  })
})

describe('shipment retry action', () => {
  const submit = async (sessionId: string) => {
    const formData = new FormData()
    formData.set('action', 'createShipment')
    formData.set('sessionId', sessionId)
    const request = new Request('http://localhost/admin/orders', {
      method: 'POST',
      body: formData
    })
    return {
      request,
      result: unwrap<{
        type: 'createShipment'
        ok: boolean
        id?: string
        error?: string
      }>(
        await action({
          context: context(),
          params: {},
          request,
          url: new URL(request.url),
          pattern: ''
        })
      )
    }
  }

  it('rejects invalid Checkout Session IDs before calling Stripe', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const { result } = await submit('../../payment-intent')

    expect(result.data).toMatchObject({
      type: 'createShipment',
      ok: false,
      error: 'Invalid Checkout Session'
    })
    expect(result.init?.status).toBe(400)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(createShipmentMock).not.toHaveBeenCalled()
  })

  it('is idempotent when Stripe already has a shipment ID', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(json(checkoutSession({ id: 'cs_test_existing', shipmentId: '777' })))
    )

    const { result } = await submit('cs_test_existing')

    expect(result.data).toEqual({
      type: 'createShipment',
      ok: true,
      id: '777'
    })
    expect(createShipmentMock).not.toHaveBeenCalled()
  })

  it('rejects orders that are not eligible for a shipping label', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        json(
          checkoutSession({
            id: 'cs_test_pickup',
            shipmentId: '',
            labelRequired: false
          })
        )
      )
    )

    const { result } = await submit('cs_test_pickup')

    expect(result.data).toMatchObject({
      type: 'createShipment',
      ok: false,
      error: 'Order is not ready for shipping'
    })
    expect(result.init?.status).toBe(409)
    expect(createShipmentMock).not.toHaveBeenCalled()
  })

  it('re-fetches authoritative Stripe data before creating a shipment', async () => {
    const session = checkoutSession({
      id: 'cs_test_authoritative',
      shipmentId: ''
    })
    const fetchMock = vi.fn().mockResolvedValue(json(session))
    vi.stubGlobal('fetch', fetchMock)
    createShipmentMock.mockResolvedValue({ ok: true, id: '888' })

    const { request, result } = await submit('cs_test_authoritative')

    expect(result.data).toEqual({
      type: 'createShipment',
      ok: true,
      id: '888'
    })
    expect(createShipmentMock).toHaveBeenCalledWith({
      context: expect.anything(),
      request,
      customer_details: session.customer_details,
      payment_intent: 'pi_cs_test_authoritative'
    })
    const [, init] = fetchMock.mock.calls[0] as [RequestInfo | URL, RequestInit]
    expect(init.headers).toMatchObject({ Authorization: 'Bearer sk_preview' })
  })

  it('returns a visible error when shipment creation fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(json(checkoutSession({ id: 'cs_test_failure', shipmentId: '' })))
    )
    createShipmentMock.mockResolvedValue({ ok: false, error: 'MyParcel rejected the address' })

    const { result } = await submit('cs_test_failure')

    expect(result.data).toMatchObject({
      type: 'createShipment',
      ok: false,
      error: 'MyParcel rejected the address'
    })
    expect(result.init?.status).toBe(502)
  })
})

describe('shipping label proxy', () => {
  it('rejects invalid shipment IDs without contacting MyParcel', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const result = unwrap<null>(
      await shippingLabelLoader({
        context: context(),
        params: { id: '../secret' },
        request: new Request('http://localhost/admin/shipping-label/secret'),
        url: new URL('http://localhost/admin/shipping-label/secret'),
        pattern: ''
      })
    )

    expect(result.init?.status).toBe(404)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('streams PDFs with preview credentials and private response headers', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response('pdf-bytes', { headers: { 'Content-Type': 'application/pdf' } })
      )
    vi.stubGlobal('fetch', fetchMock)

    const result = await shippingLabelLoader({
      context: context(),
      params: { id: '123' },
      request: new Request('http://localhost/admin/shipping-label/123'),
      url: new URL('http://localhost/admin/shipping-label/123'),
      pattern: ''
    })
    if (!(result instanceof Response)) throw new Error('Expected a PDF response')

    expect(await result.text()).toBe('pdf-bytes')
    expect(result.headers.get('Cache-Control')).toBe('private, no-store')
    expect(result.headers.get('Content-Type')).toBe('application/pdf')
    expect(result.headers.get('X-Content-Type-Options')).toBe('nosniff')
    const [input, init] = fetchMock.mock.calls[0] as [RequestInfo | URL, RequestInit]
    expect(requestedUrl(input).pathname.endsWith('/shipment_labels/123')).toBe(true)
    expect(init.headers).toEqual({
      Authorization: `bearer ${btoa('mp_preview')}`,
      Accept: 'application/pdf'
    })
  })

  it.each([
    [404, 404],
    [500, 502]
  ])('maps MyParcel %i responses to admin status %i', async (upstream, expected) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('error', { status: upstream })))

    const result = unwrap<string>(
      await shippingLabelLoader({
        context: context(),
        params: { id: '123' },
        request: new Request('https://roundandround.nl/admin/shipping-label/123'),
        url: new URL('https://roundandround.nl/admin/shipping-label/123'),
        pattern: ''
      })
    )

    expect(result.data).toBe('Cannot retrieve label PDF')
    expect(result.init?.status).toBe(expected)
    expect(result.init?.headers).toEqual({ 'Cache-Control': 'private, no-store' })
  })
})
