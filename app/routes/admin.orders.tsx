import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from 'react-router'
import { useFetcher, useLoaderData, useLocation, data } from 'react-router'
import classNames from 'classnames'
import { useEffect, useRef, useState } from 'react'
import Stripe from 'stripe'
import Button from '~/components/button'
import Layout from '~/layout'
import { getCloudflareContext } from '~/utils/cloudflare'
import { isPreviewRequest, requiredEnvValue } from '~/utils/contentful'
import { getMyparcelAuthHeader } from '~/utils/myparcelAuthHeader'
import { getStripeHeaders } from '~/utils/stripeHeaders'
import { adminNavs } from './admin._index'
import { createShipment } from './webhook.stripe'

type SessionsData = {
  has_more: boolean
  data: (Stripe.Checkout.Session & {
    payment_intent: Stripe.PaymentIntent & { latest_charge: Stripe.Charge }
    line_items: { data: Stripe.LineItem[]; has_more: boolean }
    shipping_cost?: { shipping_rate?: Stripe.ShippingRate }
  })[]
}

type TrackTrace = {
  shipment_id: number
  code: string
  description: string
  time: string
  link_consumer_portal: string
  link_tracktrace: string
  recipient: Object
}

type Order = {
  id: string
  receipt: string | null
  name: string | null
  phone: string
  email: string | null | undefined
  pickup?: string
  shipping?: {
    shipping: Stripe.Charge.Shipping | null | undefined
    labelRequired: boolean
    shipmentId?: string
    sessionId: string
  }
  items?: Pick<Stripe.LineItem, 'id' | 'description' | 'quantity'>[]
  metadata: Stripe.Metadata
}

type LoadOrdersResponse =
  | {
      type: 'orders'
      ok: true
      orders: Order[]
      hasMore: boolean
      nextCursor?: string
      since: number
      until: number
    }
  | {
      type: 'orders'
      ok: false
      error: string
    }

type LoadTrackingsResponse =
  | {
      type: 'trackings'
      ok: true
      trackings: Record<string, TrackTrace>
    }
  | {
      type: 'trackings'
      ok: false
      error: string
    }

type CreateShipmentResponse =
  | {
      type: 'createShipment'
      ok: true
      id: string
    }
  | {
      type: 'createShipment'
      ok: false
      error: string
    }

const ORDER_WINDOW_SECONDS = 60 * 60 * 24 * 7
const PAGE_SIZE = 25
const PREVIEW_PAGE_SIZE = 2
const noStoreHeaders = { 'Cache-Control': 'private, no-store' }

export const getNextOrdersUrl = (
  cursor: string,
  since: number,
  until: number,
  pageSize?: number
) => {
  const params = new URLSearchParams({
    cursor,
    since: since.toString(),
    until: until.toString()
  })
  if (pageSize === PREVIEW_PAGE_SIZE) params.set('pageSize', pageSize.toString())
  return `/admin/orders?${params}`
}

const getOrderPageSize = (request: Request) =>
  isPreviewRequest(request) &&
  new URL(request.url).searchParams.get('pageSize') === PREVIEW_PAGE_SIZE.toString()
    ? PREVIEW_PAGE_SIZE
    : PAGE_SIZE

const fetchJson = async <T,>(url: string | URL, init: RequestInit, service: string): Promise<T> => {
  const response = await fetch(url, init)
  if (!response.ok) {
    throw new Error(`${service} request failed (${response.status})`)
  }
  return response.json<T>()
}

export const normalizeShipmentIds = (ids: string[]) =>
  // ponytail: one batch covers 100 visible shipments; split page batches if weekly volume exceeds that.
  [...new Set(ids.filter((id) => /^\d+$/.test(id)))].slice(0, 100)

const getTrackings = async (
  context: LoaderFunctionArgs['context'],
  request: Request,
  ids: string[]
) => {
  const shipmentIds = normalizeShipmentIds(ids)
  if (!shipmentIds.length) return []

  const response = await fetchJson<{ data: { tracktraces: TrackTrace[] } }>(
    `https://api.myparcel.nl/tracktraces/${shipmentIds.join(';')}`,
    { headers: getMyparcelAuthHeader(context, request) },
    'MyParcel'
  )
  return response.data.tracktraces
}

const getAllLineItems = async (
  session: SessionsData['data'][number],
  stripeHeaders: HeadersInit
) => {
  const lineItems = [...session.line_items.data]
  let hasMore = session.line_items.has_more
  let cursor = lineItems[lineItems.length - 1]?.id

  while (hasMore) {
    if (!cursor) throw new Error('Stripe line-item page is missing a cursor')

    const url = new URL(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(session.id)}/line_items`
    )
    url.searchParams.set('limit', '100')
    url.searchParams.set('starting_after', cursor)
    const page = await fetchJson<{ data: Stripe.LineItem[]; has_more: boolean }>(
      url,
      { headers: stripeHeaders },
      'Stripe'
    )
    lineItems.push(...page.data)

    const nextCursor = page.data[page.data.length - 1]?.id
    if (page.has_more && (!nextCursor || nextCursor === cursor)) {
      throw new Error('Stripe line-item pagination did not advance')
    }
    cursor = nextCursor
    hasMore = page.has_more
  }

  return lineItems
}

export const loadOrders = async (
  context: LoaderFunctionArgs['context'],
  request: Request,
  {
    cursor,
    since,
    until
  }: {
    cursor?: string
    since: number
    until: number
  }
): Promise<LoadOrdersResponse> => {
  const env = getCloudflareContext(context)?.env
  const stripeHeaders = getStripeHeaders(
    requiredEnvValue(env, 'STRIPE_KEY_ADMIN', isPreviewRequest(request))
  )

  const url = new URL('https://api.stripe.com/v1/checkout/sessions')
  const params = new URLSearchParams({
    limit: getOrderPageSize(request).toString(),
    status: 'complete',
    'created[gte]': since.toString(),
    'created[lte]': until.toString()
  })
  params.append('expand[]', 'data.payment_intent')
  params.append('expand[]', 'data.payment_intent.latest_charge')
  params.append('expand[]', 'data.line_items')
  params.append('expand[]', 'data.shipping_cost.shipping_rate')
  let sessionsData: SessionsData['data'] = []
  let hasMore = false
  let nextCursor = cursor

  do {
    if (nextCursor) params.set('starting_after', nextCursor)
    else params.delete('starting_after')
    url.search = params.toString()

    const page = await fetchJson<SessionsData>(url, { headers: stripeHeaders }, 'Stripe')
    sessionsData = page.data.filter(
      (session) =>
        session.payment_intent.status === 'succeeded' &&
        session.payment_intent.created >= since &&
        session.payment_intent.created <= until
    )
    hasMore = page.has_more

    const pageCursor = page.data[page.data.length - 1]?.id
    if (page.has_more && (!pageCursor || pageCursor === nextCursor)) {
      throw new Error('Stripe order pagination did not advance')
    }
    nextCursor = pageCursor
  } while (!sessionsData.length && hasMore)

  const sessions = sessionsData.sort(
    (a, b) => b.payment_intent.latest_charge.created - a.payment_intent.latest_charge.created
  )

  const orders: Order[] = await Promise.all(
    sessions.map(async (session) => {
      const paymentIntent = session.payment_intent
      const charge = paymentIntent.latest_charge
      const lineItems = await getAllLineItems(session, stripeHeaders)

      return {
        id: session.id,
        receipt: charge.receipt_number || null,
        name: charge.billing_details.name || null,
        phone: session.customer_details?.phone || 'NOT EXIST',
        email: session.customer_details?.email,
        pickup: charge.description || charge.metadata['Pick-up date'],
        shipping: {
          shipping: charge.shipping,
          labelRequired: session.shipping_cost?.shipping_rate?.metadata.label === 'true',
          shipmentId: paymentIntent.metadata?.shipping_id,
          sessionId: session.id
        },
        items: lineItems
          .filter(
            (item) =>
              item.description !== 'Gift Card Shipping | Shipment' &&
              item.description !== 'Transaction fee' &&
              item.description !== 'Processing fee' &&
              !item.description?.includes('Pick up:')
          )
          .map(({ id, description, quantity }) => ({
            id,
            description,
            quantity
          })),
        metadata: {
          ...charge.metadata,
          ...session.metadata
        }
      }
    })
  )

  return {
    type: 'orders',
    ok: true,
    orders,
    hasMore: hasMore && Boolean(nextCursor),
    nextCursor,
    since,
    until
  }
}

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const trackingIds = normalizeShipmentIds(url.searchParams.getAll('trackingId'))

  if (url.searchParams.has('trackingId')) {
    try {
      const trackings = await getTrackings(context, request, trackingIds)
      return data(
        {
          type: 'trackings',
          ok: true,
          trackings: Object.fromEntries(
            trackings.map((tracking) => [tracking.shipment_id.toString(), tracking])
          )
        } satisfies LoadTrackingsResponse,
        { headers: noStoreHeaders }
      )
    } catch {
      return data(
        {
          type: 'trackings',
          ok: false,
          error: 'Unable to load shipping statuses'
        } satisfies LoadTrackingsResponse,
        { status: 502, headers: noStoreHeaders }
      )
    }
  }

  const now = Math.floor(Date.now() / 1000)
  const requestedUntil = Number(url.searchParams.get('until'))
  const until =
    Number.isSafeInteger(requestedUntil) && requestedUntil > 0 && requestedUntil <= now
      ? requestedUntil
      : now
  const requestedSince = Number(url.searchParams.get('since'))
  const since =
    Number.isSafeInteger(requestedSince) &&
    requestedSince > 0 &&
    requestedSince <= until &&
    until - requestedSince <= ORDER_WINDOW_SECONDS
      ? requestedSince
      : until - ORDER_WINDOW_SECONDS

  try {
    return data(
      await loadOrders(context, request, {
        cursor: url.searchParams.get('cursor') || undefined,
        since,
        until
      }),
      { headers: noStoreHeaders }
    )
  } catch {
    return data(
      {
        type: 'orders',
        ok: false,
        error: 'Unable to load orders'
      } satisfies LoadOrdersResponse,
      { status: 502, headers: noStoreHeaders }
    )
  }
}

export const action = async ({ context, request }: ActionFunctionArgs) => {
  const env = getCloudflareContext(context)?.env
  const formData = await request.formData()
  const action = formData.get('action')?.toString()

  switch (action) {
    case 'createShipment': {
      const sessionId = formData.get('sessionId')?.toString()
      if (!sessionId || !/^cs_(?:test_|live_)?[A-Za-z0-9]+$/.test(sessionId)) {
        return data(
          {
            type: 'createShipment',
            ok: false,
            error: 'Invalid Checkout Session'
          } satisfies CreateShipmentResponse,
          { status: 400, headers: noStoreHeaders }
        )
      }

      try {
        const stripeHeaders = getStripeHeaders(
          requiredEnvValue(env, 'STRIPE_KEY_ADMIN', isPreviewRequest(request))
        )
        const session = await fetchJson<
          Stripe.Checkout.Session & {
            payment_intent: Stripe.PaymentIntent
            shipping_cost?: { shipping_rate?: Stripe.ShippingRate }
          }
        >(
          `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=payment_intent&expand[]=shipping_cost.shipping_rate`,
          { headers: stripeHeaders },
          'Stripe'
        )

        const existingShipmentId = session.payment_intent.metadata.shipping_id
        if (existingShipmentId) {
          return data(
            {
              type: 'createShipment',
              ok: true,
              id: existingShipmentId
            } satisfies CreateShipmentResponse,
            { headers: noStoreHeaders }
          )
        }

        if (
          session.status !== 'complete' ||
          session.payment_intent.status !== 'succeeded' ||
          !session.customer_details?.address ||
          session.shipping_cost?.shipping_rate?.metadata.label !== 'true'
        ) {
          return data(
            {
              type: 'createShipment',
              ok: false,
              error: 'Order is not ready for shipping'
            } satisfies CreateShipmentResponse,
            { status: 409, headers: noStoreHeaders }
          )
        }

        const resShipment = await createShipment({
          context,
          request,
          customer_details: session.customer_details,
          payment_intent: session.payment_intent.id
        })
        return data(
          resShipment.ok
            ? { type: 'createShipment', ok: true, id: resShipment.id }
            : {
                type: 'createShipment',
                ok: false,
                error: resShipment.error || 'Shipment creation failed'
              },
          { status: resShipment.ok ? 200 : 502, headers: noStoreHeaders }
        )
      } catch {
        return data(
          {
            type: 'createShipment',
            ok: false,
            error: 'Shipment creation failed'
          } satisfies CreateShipmentResponse,
          { status: 502, headers: noStoreHeaders }
        )
      }
    }

    default:
      return data(
        {
          type: 'createShipment',
          ok: false,
          error: 'Unknown admin action'
        } satisfies CreateShipmentResponse,
        { status: 400, headers: noStoreHeaders }
      )
  }
}

/* v8 ignore start */
const Shipping: React.FC<{
  shipping: NonNullable<Order['shipping']>
  trackTrace?: TrackTrace
}> = ({ shipping, trackTrace }) => {
  const createFetcher = useFetcher<CreateShipmentResponse>()
  const trackingFetcher = useFetcher<LoadTrackingsResponse>()
  const createResult = createFetcher.data
  const createId =
    createResult?.type === 'createShipment' && createResult.ok ? createResult.id : undefined
  const createError =
    createResult?.type === 'createShipment' && !createResult.ok ? createResult.error : undefined
  const shipmentId = shipping.shipmentId || createId
  const refreshedTracking =
    trackingFetcher.data?.type === 'trackings' && trackingFetcher.data.ok && shipmentId
      ? trackingFetcher.data.trackings[shipmentId]
      : undefined
  const phase = refreshedTracking?.description || trackTrace?.description
  const trackingFailed = trackingFetcher.data?.type === 'trackings' && !trackingFetcher.data.ok
  const trackingLoading = trackingFetcher.state !== 'idle'

  return (
    <>
      {shipping?.shipping ? (
        <div>
          <strong>Shipping: </strong>
          {[
            shipping.shipping.name,
            [shipping.shipping.address?.line1, shipping.shipping.address?.line2].join(' '),
            shipping.shipping.address?.postal_code,
            shipping.shipping.address?.city,
            shipping.shipping.address?.country !== 'NL' ? shipping.shipping.address?.country : null
          ]
            .filter((info) => !!info)
            .join(', ')}
        </div>
      ) : null}
      {shipping.labelRequired && !shipmentId ? (
        <createFetcher.Form
          method='post'
          action='/admin/orders'
          className='flex gap-1 items-center'
        >
          <strong className='text-red-600'>Label creation failed!</strong>
          <input type='hidden' name='action' value='createShipment' />
          <input type='hidden' name='sessionId' value={shipping.sessionId} />
          <button
            type='submit'
            disabled={createFetcher.state !== 'idle'}
            className={classNames(
              'border-b-2 border-spacing-2 border-neutral-700 border-dotted hover:border-solid transition-opacity',
              createFetcher.state !== 'idle' ? 'opacity-30' : ''
            )}
          >
            {createFetcher.state === 'idle' ? 'Retry' : 'Retrying...'}
          </button>
        </createFetcher.Form>
      ) : null}
      {createError ? (
        <div
          className='bg-red-100 border border-red-400 text-red-700 p-2 rounded mt-1'
          role='alert'
        >
          {createError}
        </div>
      ) : null}
      {shipmentId ? (
        <div>
          <span className='block'>
            <strong>Label: </strong>
            <a
              href={`/admin/shipping-label/${shipmentId}`}
              target='_blank'
              className='border-b-2 border-spacing-2 border-neutral-700 border-dotted hover:border-solid'
              children={shipmentId}
            />
          </span>
          <span className='block'>
            <strong>Status: </strong>
            {trackingLoading ? (
              <span aria-live='polite'>Loading...</span>
            ) : phase ? (
              phase
            ) : (
              <button
                type='button'
                className={classNames(
                  'border-b-2 border-spacing-2 border-neutral-700 border-dotted hover:border-solid',
                  trackingFailed ? 'text-red-600' : undefined
                )}
                onClick={() =>
                  trackingFetcher.load(
                    `/admin/orders?${new URLSearchParams({ trackingId: shipmentId })}`
                  )
                }
              >
                {trackingFailed ? 'Try again later' : 'Refresh'}
              </button>
            )}
          </span>
        </div>
      ) : null}
    </>
  )
}

export const meta: MetaFunction = () => [
  {
    title: 'Orders | Round&Round Rotterdam'
  }
]

const PageAdminOrders: React.FC = () => {
  const initialData = useLoaderData<typeof loader>()
  const location = useLocation()
  const fetcher = useFetcher<LoadOrdersResponse>()
  const trackingFetcher = useFetcher<LoadTrackingsResponse>()

  const initialOrders = initialData.type === 'orders' && initialData.ok ? initialData.orders : []
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [hasMore, setHasMore] = useState(
    initialData.type === 'orders' && initialData.ok ? initialData.hasMore : false
  )
  const cursor = useRef<string | undefined>(
    initialData.type === 'orders' && initialData.ok ? initialData.nextCursor : undefined
  )
  const since = useRef(
    initialData.type === 'orders' && initialData.ok ? initialData.since : undefined
  )
  const until = useRef(
    initialData.type === 'orders' && initialData.ok ? initialData.until : undefined
  )

  const loading = fetcher.state !== 'idle'
  const previewPageSize =
    new URLSearchParams(location.search).get('pageSize') === PREVIEW_PAGE_SIZE.toString()
      ? PREVIEW_PAGE_SIZE
      : undefined

  useEffect(() => {
    const result = fetcher.data
    if (fetcher.state === 'idle' && result?.type === 'orders' && result.ok) {
      setOrders((previous) => {
        const existing = new Set(previous.map((order) => order.id))
        return [...previous, ...result.orders.filter((order) => !existing.has(order.id))]
      })
      setHasMore(result.hasMore)
      cursor.current = result.nextCursor
      since.current = result.since
      until.current = result.until
    }
  }, [fetcher.state, fetcher.data])

  const shipmentIds = orders
    .map((order) => order.shipping?.shipmentId)
    .filter((id): id is string => Boolean(id))
    .join(',')

  useEffect(() => {
    if (!shipmentIds) return

    const params = new URLSearchParams()
    shipmentIds.split(',').forEach((id) => params.append('trackingId', id))
    trackingFetcher.load(`/admin/orders?${params}`)
  }, [shipmentIds])

  const loadMore = () => {
    if (!loading && hasMore && cursor.current && since.current && until.current) {
      fetcher.load(
        getNextOrdersUrl(cursor.current, since.current, until.current, previewPageSize)
      )
    }
  }

  const trackings =
    trackingFetcher.data?.type === 'trackings' && trackingFetcher.data.ok
      ? trackingFetcher.data.trackings
      : {}
  const initialError =
    initialData.type === 'orders' && !initialData.ok ? initialData.error : undefined
  const paginationError =
    fetcher.data?.type === 'orders' && !fetcher.data.ok ? fetcher.data.error : undefined
  const trackingError =
    trackingFetcher.data?.type === 'trackings' && !trackingFetcher.data.ok
      ? trackingFetcher.data.error
      : undefined

  return (
    <Layout navs={adminNavs}>
      {initialError ? (
        <div
          className='mx-4 rounded border border-red-400 bg-red-100 p-4 text-red-700'
          role='alert'
        >
          <p>{initialError}</p>
          <Button className='mt-2' onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      ) : (
        <>
          {trackingError ? (
            <p className='mx-4 mb-2 text-sm text-red-700' role='status'>
              {trackingError}
            </p>
          ) : null}
          <div className='overflow-x-auto'>
            <table className='table-auto w-full text-sm'>
              <thead className='sticky top-0 z-10 bg-white'>
                <tr className='border-b border-neutral-300'>
                  <th scope='col' className='p-2'>
                    Receipt
                  </th>
                  <th scope='col' className='p-2'>
                    👤 Name
                  </th>
                  <th scope='col' className='p-2'>
                    📱 Phone
                  </th>
                  <th scope='col' className='p-2'>
                    📧 Email
                  </th>
                  <th scope='col' className='p-2'>
                    Pickup | Shipping
                  </th>
                  <th scope='col' className='p-2'>
                    Cakes
                  </th>
                  <th scope='col' className='p-2'>
                    Gift Card | Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    data-order-id={order.id}
                    className='border-b border-neutral-300 hover:bg-neutral-100'
                  >
                    <td className='p-2 whitespace-nowrap' children={order.receipt} />
                    <td className='p-2 whitespace-nowrap' children={order.name} />
                    <td className='p-2 whitespace-nowrap'>
                      {order.phone === 'NOT EXIST' ? (
                        order.phone
                      ) : (
                        <a href={`tel:${order.phone}`} className='hover:underline'>
                          {order.phone}
                        </a>
                      )}
                    </td>
                    <td className='p-2 whitespace-nowrap'>
                      {order.email ? (
                        <a href={`mailto:${order.email}`} className='hover:underline'>
                          {order.email}
                        </a>
                      ) : null}
                    </td>
                    <td className='p-2 max-w-sm'>
                      {order.pickup ? (
                        <div className={order.shipping ? 'mb-2' : undefined}>
                          <strong>Pickup: </strong>
                          {order.pickup.replace('🛍️ pickup date: ', '')}
                        </div>
                      ) : null}
                      {order.shipping?.shipping ? (
                        <Shipping
                          shipping={order.shipping}
                          trackTrace={
                            order.shipping.shipmentId
                              ? trackings[order.shipping.shipmentId]
                              : undefined
                          }
                        />
                      ) : null}
                    </td>
                    <td className='p-2 max-w-2xl'>
                      {order.items?.map((item) => (
                        <div key={item.id} className='mb-4 last:mb-0'>
                          <strong>{item.quantity}</strong>
                          {` \u00d7 `}
                          {item.description}
                        </div>
                      ))}
                    </td>
                    <td className='p-2 max-w-sm'>
                      {Object.keys(order.metadata).map((key) => (
                        <div key={key}>
                          <b>{key}:</b> {order.metadata[key]}
                        </div>
                      ))}
                    </td>
                  </tr>
                ))}
                {!orders.length ? (
                  <tr>
                    <td colSpan={7} className='p-4 text-center text-neutral-600'>
                      No orders found
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <div className='p-2 text-center' aria-live='polite'>
            {paginationError ? (
              <div className='text-red-700' role='alert'>
                <p>{paginationError}</p>
                <Button className='mx-auto mt-2' onClick={loadMore}>
                  Retry
                </Button>
              </div>
            ) : hasMore ? (
              <Button disabled={loading} className='mx-auto' onClick={loadMore}>
                {loading ? 'Loading...' : 'Load more'}
              </Button>
            ) : (
              <p className='text-neutral-600'>The end</p>
            )}
          </div>
        </>
      )}
    </Layout>
  )
}

export default PageAdminOrders
/* v8 ignore stop */
