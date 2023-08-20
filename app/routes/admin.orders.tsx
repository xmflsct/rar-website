import { ActionArgs, json, LoaderArgs, V2_MetaFunction } from '@remix-run/cloudflare'
import { useFetcher, useLoaderData } from '@remix-run/react'
import classNames from 'classnames'
import { useEffect, useRef, useState } from 'react'
import Stripe from 'stripe'
import Button from '~/components/button'
import Layout from '~/layout'
import { getMyparcelAuthHeader } from '~/utils/myparcelAuthHeader'
import { getStripeHeaders } from '~/utils/stripeHeaders'
import { adminNavs } from './admin._index'
import { createShipment } from './webhook.stripe'

type SessionsData = {
  has_more: boolean
  data: (Stripe.Checkout.Session & {
    payment_intent: Stripe.PaymentIntent & { latest_charge: Stripe.Charge }
    line_items: { data: Stripe.LineItem[] }
    shipping_cost?: { shipping_rate?: Stripe.ShippingRate }
  })[]
}
export const loader = async ({ context }: LoaderArgs) => {
  if (!context?.STRIPE_KEY_ADMIN) {
    throw json(null, { status: 500 })
  } else {
    return json({
      stripeHeaders: getStripeHeaders(context.STRIPE_KEY_ADMIN),
      myparcelAuthHeader: getMyparcelAuthHeader(context)
    })
  }
}

export const action = async ({ context, request }: ActionArgs) => {
  const formData = await request.formData()
  const action = formData.get('action')?.toString()
  const data = JSON.parse(formData.get('data')?.toString() || '')

  switch (action) {
    case 'createShipment':
      const resShipment = await createShipment({ context, ...data })
      if (resShipment.ok) {
        return json({ ok: true, id: resShipment.id }, 200)
      } else {
        return json({ ok: false }, 500)
      }
    default:
      return json({ ok: false, error: 'How did you get here?' }, { status: 400 })
  }
}

export const meta: V2_MetaFunction = () => [
  {
    title: 'Orders | Round&Round Rotterdam'
  }
]

type TrackTrace = {
  shipment_id: number
  code: string
  description: string // Zending bezorgd
  time: string
  link_consumer_portal: string
  link_tracktrace: string
  recipient: Object
}

type Order = {
  receipt: string | null
  name: string | null
  phone: string
  email: string | null | undefined
  pickup?: string
  shipping?: {
    shipping: Stripe.Charge.Shipping | null | undefined
    payment_intent: Stripe.PaymentIntent
    shipping_rate?: Stripe.ShippingRate
    trackTrace?: TrackTrace
    internal: { customer_details: Stripe.Checkout.Session.CustomerDetails; payment_intent: string }
  }
  items?: Stripe.LineItem[]
  metadata: Stripe.Metadata
}

const getTrackings = async (myparcelAuthHeader: { Authorization: string }, ids: string[]) =>
  (
    await (
      await fetch(`	https://api.myparcel.nl/tracktraces/${ids.join(';')}`, {
        headers: myparcelAuthHeader
      })
    ).json<{ data: { tracktraces: TrackTrace[] } }>()
  ).data.tracktraces

const Shipping: React.FC<{
  myparcelAuthHeader: { Authorization: string }
  shipping: NonNullable<Order['shipping']>
  customer_details: Stripe.Checkout.Session.CustomerDetails
  payment_intent: string
}> = ({ myparcelAuthHeader, shipping, ...rest }) => {
  const fetcher = useFetcher()

  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const [phase, setPhase] = useState<string | undefined>(shipping.trackTrace?.description)
  const fetchPhase = async () => {
    setLoading(true)
    setFailed(false)
    const res = await getTrackings(myparcelAuthHeader, [
      shipping.payment_intent.metadata?.shipping_id
    ])

    setLoading(false)
    if (res?.[0].description) {
      setFailed(false)
      setPhase(res?.[0].description)
    } else {
      setFailed(true)
      setPhase(undefined)
    }
  }
  const buttonContent = (): string => {
    if (loading) {
      return 'Loading...'
    } else {
      if (failed) {
        return 'Try again later'
      } else {
        if (phase) {
          return phase
        } else {
          return 'Refresh'
        }
      }
    }
  }

  useEffect(() => {
    if (fetcher.state === 'loading') {
      fetchPhase()
    }
  }, [fetcher.state])

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
            .filter(info => !!info)
            .join(', ')}
        </div>
      ) : null}
      {
        // @ts-ignore
        (shipping?.shipping_rate?.metadata.label == true ||
          shipping?.shipping_rate?.metadata.label == 'true') &&
        !shipping.payment_intent.metadata?.shipping_id ? (
          <fetcher.Form method='post' action='/admin/orders' className='flex gap-1 items-middle'>
            <strong className='text-red-600'>Label creation failed!</strong>
            <input name='action' value='createShipment' hidden />
            <input name='data' value={JSON.stringify({ ...rest })} hidden />
            <button
              type='submit'
              className='border-b-2 border-spacing-2 border-neutral-700 border-dotted hover:border-solid'
            >
              Retry
            </button>
          </fetcher.Form>
        ) : null
      }
      {shipping?.payment_intent.metadata?.shipping_id ? (
        <div>
          <span className='block'>
            <strong>Label: </strong>
            <a
              href={`/admin/shipping-label/${shipping.payment_intent.metadata?.shipping_id}`}
              target='_blank'
              className='border-b-2 border-spacing-2 border-neutral-700 border-dotted hover:border-solid'
              children={shipping.payment_intent.metadata?.shipping_id}
            />
          </span>
          <span className='block'>
            <strong>Status: </strong>
            <span
              className={classNames(
                failed ? 'text-red-600' : undefined,
                loading || phase
                  ? undefined
                  : 'cursor-pointer border-b-2 border-spacing-2 border-neutral-700 border-dotted hover:border-solid'
              )}
              onClick={() => !loading && !phase && fetchPhase()}
            >
              {buttonContent()}
            </span>
          </span>
        </div>
      ) : null}
    </>
  )
}

const PageAdminOrders: React.FC = () => {
  const { stripeHeaders, myparcelAuthHeader } = useLoaderData<typeof loader>()

  const DAYS = 60 * 60 * 24 * 7
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [hasMore, setHasMore] = useState<boolean>(false)
  const cursor = useRef<string>()

  const loadData = async () => {
    setLoading(true)

    const fetchSessions = async () => {
      const url = new URL('https://api.stripe.com/v1/checkout/sessions')

      const params = new URLSearchParams()
      params.append('limit', '5')
      params.append('expand[]', 'data.payment_intent')
      params.append('expand[]', 'data.payment_intent.latest_charge')
      params.append('expand[]', 'data.line_items')
      params.append('expand[]', 'data.shipping_cost.shipping_rate')
      cursor.current && params.append('starting_after', cursor.current)
      url.search = params.toString()

      return await (await fetch(url, { headers: stripeHeaders })).json<SessionsData>()
    }

    const { data, has_more }: SessionsData = await fetchSessions()

    setHasMore(has_more)
    cursor.current = data[data.length - 1].id

    const sessions = data
      .filter(
        session =>
          session.status === 'complete' &&
          session.payment_intent.status === 'succeeded' &&
          session.payment_intent.created >= Date.now() / 1000 - DAYS
      )
      .sort((a, b) => {
        return b.payment_intent.latest_charge.created - a.payment_intent.latest_charge.created
      })

    const lineItems: { id: Stripe.Checkout.Session['id']; lineItems: Stripe.LineItem[] }[] = []
    const shippingIds: string[] = []
    const sessionIDs = sessions.map(item => {
      if (item.payment_intent.metadata?.shipping_id) {
        shippingIds.push(item.payment_intent.metadata?.shipping_id)
      }
      return item.id
    })
    const fetchLineItems = async (id: string) => {
      return (
        await (
          await fetch(`https://api.stripe.com/v1/checkout/sessions/${id}/line_items?limit=50`, {
            headers: stripeHeaders
          })
        ).json<{
          data: Stripe.LineItem[]
        }>()
      ).data
    }
    for (const id of sessionIDs) {
      lineItems.push({ id, lineItems: await fetchLineItems(id) })
    }
    const shippingStatuses = shippingIds.length
      ? await getTrackings(myparcelAuthHeader, shippingIds)
      : []

    setOrders([
      ...orders,
      ...sessions.map(session => {
        return {
          receipt: session.payment_intent.latest_charge.receipt_number || null,
          name: session.payment_intent.latest_charge.billing_details.name || null,
          phone: session.customer_details?.phone || 'NOT EXIST',
          email: session.customer_details?.email,
          pickup:
            session.payment_intent.latest_charge.description ||
            session.payment_intent.latest_charge.metadata['Pick-up date'],
          shipping: {
            shipping: session.payment_intent.latest_charge.shipping,
            payment_intent: session.payment_intent,
            shipping_rate: session.shipping_cost?.shipping_rate,
            trackTrace: shippingStatuses.find(
              shipping =>
                shipping.shipment_id.toString() === session.payment_intent.metadata?.shipping_id
            ),
            internal: {
              customer_details: session.customer_details!,
              payment_intent: session.payment_intent.id
            }
          },
          items: lineItems
            .find(i => i.id === session.id)
            ?.lineItems.filter(
              item =>
                item.description !== 'Gift Card Shipping | Shipment' &&
                item.description !== 'Transaction fee' &&
                item.description !== 'Processing fee' &&
                !item.description.includes('Pick up:')
            ),
          metadata: {
            ...session.payment_intent.latest_charge.metadata,
            ...session.metadata
          }
        }
      })
    ])

    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const buttonContent = () => {
    if (loading) {
      return (
        <>
          <svg
            className='animate-spin -ml-1 mr-3 h-5 w-5'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            ></circle>
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            ></path>
          </svg>
          Loading
        </>
      )
    } else {
      if (hasMore) {
        return <>Load more</>
      } else {
        return <>The end</>
      }
    }
  }

  return (
    <Layout navs={adminNavs}>
      <table className='table-auto w-full text-sm'>
        <tbody>
          <tr className='border-b border-neutral-300'>
            <th className='p-2'>Receipt</th>
            <th className='p-2'>👤 Name</th>
            <th className='p-2'>📱 Phone</th>
            <th className='p-2'>📧 Email</th>
            <th className='p-2'>Pickup | Shipping</th>
            <th className='p-2'>Cakes</th>
            <th className='p-2'>Gift Card | Notes</th>
          </tr>
          {orders.map((order, index) => (
            <tr key={index} className='border-b border-neutral-300 hover:bg-neutral-100'>
              <td className='p-2 whitespace-nowrap' children={order.receipt} />
              <td className='p-2 whitespace-nowrap' children={order.name} />
              <td className='p-2 whitespace-nowrap' children={order.phone} />
              <td className='p-2 whitespace-nowrap' children={order.email} />
              <td className='p-2 max-w-sm'>
                {order.pickup ? (
                  <div className={order.shipping ? 'mb-2' : undefined}>
                    <strong>Pickup: </strong>
                    {order.pickup.replace('🛍️ pickup date: ', '')}
                  </div>
                ) : null}
                {order.shipping ? (
                  <Shipping
                    myparcelAuthHeader={myparcelAuthHeader}
                    shipping={order.shipping}
                    {...order.shipping.internal}
                  />
                ) : null}
              </td>
              <td className='p-2 max-w-2xl'>
                {order.items &&
                  order.items.map((item, index) => (
                    <div key={index} className='mb-4 last:mb-0'>
                      <strong>{item.quantity}</strong>
                      {` \u00d7 `}
                      {item.description}
                    </div>
                  ))}
              </td>
              <td className='p-2 max-w-sm'>
                {Object.keys(order.metadata).map((key, index) => (
                  <div key={index}>
                    <b>{key}:</b> {order.metadata[key]}
                  </div>
                ))}
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={7} className='py-2'>
              <Button
                disabled={loading}
                className='mx-auto'
                onClick={() => {
                  if (!loading) {
                    loadData()
                  }
                }}
              >
                {buttonContent()}
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
    </Layout>
  )
}

export default PageAdminOrders
