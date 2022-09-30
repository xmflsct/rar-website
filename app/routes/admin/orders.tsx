import { json, LoaderArgs, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { useEffect, useRef, useState } from 'react'
import Stripe from 'stripe'
import Button from '~/components/button'
import Layout from '~/layout'
import { adminNavs } from '.'

type SessionsData = {
  has_more: boolean
  data: (Stripe.Checkout.Session & {
    payment_intent: Stripe.PaymentIntent
    line_items: { data: Stripe.LineItem[] }
  })[]
}
export const loader = async (props: LoaderArgs) => {
  if (!props.context?.STRIPE_KEY_ADMIN) {
    throw json('Stripe key missing', { status: 500 })
  } else {
    return json(`Bearer ${props.context.STRIPE_KEY_ADMIN}`)
  }
}

export const meta: MetaFunction = () => ({
  title: 'Orders | Round&Round Rotterdam'
})

const PageAdminOrders: React.FC = () => {
  const Authorization = useLoaderData<typeof loader>()

  const DAYS = 60 * 60 * 24 * 7
  const [orders, setOrders] = useState<
    {
      receipt: string | null
      name: string | null
      phone: string
      email: string | null | undefined
      date: string
      shipping: Stripe.Charge.Shipping | null
      items: {
        name: string
        description: string | null | undefined
        price: number
        quantity: number | null
      }[]
      metadata: Stripe.Metadata
    }[]
  >([])
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
      params.append('expand[]', 'data.line_items')
      cursor.current && params.append('starting_after', cursor.current)
      url.search = params.toString()

      return await (await fetch(url, { headers: { Authorization } })).json<SessionsData>()
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
        return (
          b.payment_intent.charges.data[b.payment_intent.charges.data.length - 1].created -
          a.payment_intent.charges.data[a.payment_intent.charges.data.length - 1].created
        )
      })

    const productIds = sessions.flatMap(session =>
      session.line_items?.data
        .filter(item => item.description !== 'Transaction fee')
        .map(item => item.price?.product)
    ) as string[]

    const fetchPrices = async (ids: string[]) => {
      const url = new URL('https://api.stripe.com/v1/prices/search')

      const params = new URLSearchParams()
      params.append('expand[]', 'data.product')
      params.append('query', ids.map(id => `product:"${id}"`).join(' OR '))
      url.search = params.toString()

      return await (
        await fetch(url, { headers: { Authorization } })
      ).json<{
        data: Stripe.Price[]
      }>()
    }

    const products: Stripe.Product[] = []
    let chunkIds: string[]
    while (productIds.length > 0) {
      chunkIds = productIds.splice(0, 10)
      products.push(
        ...(await fetchPrices(chunkIds)).data.map(price => price.product as Stripe.Product)
      )
    }

    setOrders([
      ...orders,
      ...sessions.map(session => {
        return {
          receipt: session.payment_intent?.charges?.data[0].receipt_number || null,
          name: session.payment_intent.charges?.data[0].billing_details.name || null,
          phone:
            session.customer_details?.phone ||
            session.payment_intent.charges?.data[0].metadata['Phone number'] ||
            'ERROR',
          email: session.customer_details?.email,
          date:
            session.payment_intent.charges?.data[0].description ||
            session.payment_intent.charges?.data[0].metadata['Pick-up date'] ||
            'ERROR',
          shipping: session.payment_intent.charges?.data[0].shipping || null,
          items: session.line_items.data
            .map(item => ({
              ...item,
              price: {
                ...item.price,
                product: products.find(product => product.id === item.price?.product)
              }
            }))
            .filter(
              item =>
                item.description !== 'Gift Card Shipping | Shipment' &&
                item.description !== 'Transaction fee' &&
                !item.description.includes('Pick up:')
            )
            .map(item => ({
              name: item.description,
              description: item.price.product?.description,
              price: (item.price?.unit_amount || 0) / 10 / 10,
              quantity: item.quantity
            })),
          metadata: {
            ...session.payment_intent.charges?.data[0].metadata,
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
            <th className='p-2'>Date and/or Address</th>
            <th className='p-2'>Cakes</th>
            <th className='p-2'>Gift Card and/or Notes</th>
          </tr>
          {orders.map((order, index) => (
            <tr key={index} className='border-b border-neutral-300 hover:bg-neutral-100'>
              <td className='p-2 whitespace-nowrap' children={order.receipt} />
              <td className='p-2 whitespace-nowrap' children={order.name} />
              <td className='p-2 whitespace-nowrap' children={order.phone} />
              <td className='p-2 whitespace-nowrap' children={order.email} />
              <td className='p-2 max-w-sm'>
                {order.date ? (
                  <div>
                    <strong>Date: </strong>
                    {order.date.replace('🛍️ pickup date: ', '')}
                  </div>
                ) : null}
                {order.shipping ? (
                  <div>
                    <strong>Address: </strong>
                    {order.shipping.name}
                    {', '}
                    {order.shipping.address?.line1}
                    {order.shipping.address?.line2 ? ' ' + order.shipping.address.line2 : null}
                    {', '}
                    {order.shipping.address?.postal_code}
                    {', '}
                    {order.shipping.address?.city}
                  </div>
                ) : null}
              </td>
              <td className='p-2 max-w-2xl'>
                {order.items &&
                  order.items.map((item, index) => (
                    <div key={index} className='mb-4 last:mb-0'>
                      <strong>{item.quantity}</strong>
                      {` \u00d7 `}
                      {item.name}
                      <br />
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
