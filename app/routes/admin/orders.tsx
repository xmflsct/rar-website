import { json, LoaderArgs } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import Stripe from 'stripe'
import Layout from '~/layout'
import { adminNavs } from '.'

type SessionsData = {
  data: (Stripe.Checkout.Session & {
    payment_intent: Stripe.PaymentIntent
    line_items: { data: Stripe.LineItem[] }
  })[]
}
export const loader = async (props: LoaderArgs) => {
  const headers = {
    Authorization: `Basic ${btoa(`${props.context.STRIPE_KEY_ADMIN}:`)}`
  }
  const DAYS = 60 * 60 * 24 * 7

  const fetchSessions = async (cursor?: string) => {
    const url = new URL('https://api.stripe.com/v1/checkout/sessions')

    const params = new URLSearchParams()
    params.append('limit', '100')
    params.append('expand[]', 'data.payment_intent')
    params.append('expand[]', 'data.line_items')
    cursor && params.append('starting_after', cursor)
    url.search = params.toString()

    return await (await fetch(url, { headers })).json<SessionsData>()
  }

  const sessionsRaw = []

  let cursor = undefined
  let hasMore = true
  while (hasMore) {
    const data: SessionsData = await fetchSessions(cursor)

    const lastCreated = data.data[data.data.length - 1].payment_intent.created
    if (Date.now() / 1000 - lastCreated > DAYS) {
      hasMore = false
    } else {
      hasMore = true
      cursor = data.data[data.data.length - 1].id
    }
    sessionsRaw.push(...data.data)
  }

  const sessions = sessionsRaw
    .filter(
      session =>
        session.status === 'complete' &&
        session.payment_intent.status === 'succeeded' &&
        session.payment_intent.created >= Date.now() / 1000 - DAYS
    )
    .sort((a, b) => {
      return (
        b.payment_intent.charges.data[b.payment_intent.charges.data.length - 1]
          .created -
        a.payment_intent.charges.data[a.payment_intent.charges.data.length - 1]
          .created
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
      await fetch(url, { headers })
    ).json<{ data: Stripe.Price[] }>()
  }

  const products: Stripe.Product[] = []
  let chunkIds: string[]
  while (productIds.length > 0) {
    chunkIds = productIds.splice(0, 10)
    products.push(
      ...(await fetchPrices(chunkIds)).data.map(
        price => price.product as Stripe.Product
      )
    )
  }

  return json({
    data: sessions.map(session => ({
      ...session,
      line_items: session.line_items.data.map(item => ({
        ...item,
        price: {
          ...item.price,
          product: products.find(product => product.id === item.price?.product)
        }
      }))
    }))
  })
}

const PageAdminOrders: React.FC = () => {
  const { data } = useLoaderData<typeof loader>()

  const orderList = data.map(session => {
    return {
      receipt: session.payment_intent?.charges.data[0].receipt_number,
      name: session.payment_intent.charges.data[0].billing_details.name,
      phone:
        session.customer_details?.phone ||
        session.payment_intent.charges.data[0].metadata['Phone number'],
      email: session.customer_details?.email,
      date:
        session.payment_intent.charges.data[0].description ||
        session.payment_intent.charges.data[0].metadata['Pick-up date'],
      shipping: session.payment_intent.charges.data[0].shipping,
      items: session.line_items
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
        ...session.payment_intent.charges.data[0].metadata,
        ...session.metadata
      }
    }
  })

  return (
    <Layout navs={adminNavs}>
      <table className='table-auto w-full text-sm'>
        <tbody>
          <tr>
            <th className='p-2'>Receipt</th>
            <th className='p-2'>Date and/or Address</th>
            <th className='p-2'>Customer</th>
            <th className='p-2'>Items</th>
            <th className='p-2'>Gift Card and/or Notes</th>
          </tr>
          {orderList.map((order, index) => (
            <tr
              key={index}
              className='border-t border-neutral-300 hover:bg-neutral-50'
            >
              <td className='p-2 text-center whitespace-nowrap'>
                <input
                  readOnly
                  type='text'
                  value={order.receipt || ''}
                  onFocus={e =>
                    e.target.setSelectionRange(0, order.receipt?.length || 999)
                  }
                  size={10}
                  className='bg-transparent'
                />
              </td>
              <td className='p-2 max-w-sm'>
                {order.date ? (
                  <div>
                    <strong>Date: </strong>
                    {order.date}
                  </div>
                ) : null}
                {order.shipping ? (
                  <div>
                    <strong>Address: </strong>
                    {order.shipping.name}
                    {', '}
                    {order.shipping.address?.line1}
                    {order.shipping.address?.line2
                      ? ' ' + order.shipping.address.line2
                      : null}
                    {', '}
                    {order.shipping.address?.postal_code}
                    {', '}
                    {order.shipping.address?.city}
                  </div>
                ) : null}
              </td>
              <td className='p-2'>
                <div className='flex flex-col'>
                  <input
                    readOnly
                    type='text'
                    value={order.name || ''}
                    onFocus={e =>
                      e.target.setSelectionRange(0, order.name?.length || 999)
                    }
                    size={25}
                    className='bg-transparent'
                  />
                  <input
                    readOnly
                    type='text'
                    value={order.phone}
                    onFocus={e =>
                      e.target.setSelectionRange(0, order.phone?.length || 999)
                    }
                    size={25}
                    className='bg-transparent'
                  />
                  <input
                    readOnly
                    type='text'
                    value={order.email || ''}
                    onFocus={e =>
                      e.target.setSelectionRange(0, order.email?.length || 999)
                    }
                    size={25}
                    className='bg-transparent'
                  />
                </div>
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
        </tbody>
      </table>
    </Layout>
  )
}

export default PageAdminOrders
