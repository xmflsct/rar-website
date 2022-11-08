import { json, LoaderArgs, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { useEffect } from 'react'
import Stripe from 'stripe'
import Layout from '~/layout'
import { full } from '~/utils/currency'

export const loader = async (props: LoaderArgs) => {
  if (!props.params.session) {
    throw json('Not Found', { status: 404 })
  }

  const session = await (
    await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${props.params.session}?expand[]=payment_intent`,
      {
        headers: { Authorization: `Bearer ${props.context?.STRIPE_KEY_ADMIN}` }
      }
    )
  ).json<Stripe.Checkout.Session & { payment_intent: Stripe.PaymentIntent }>()

  if (session.payment_status !== 'paid') {
    throw json('Not Paid', { status: 404 })
  }

  const line_items = await (
    await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${props.params.session}/line_items?limit=100`,
      {
        headers: { Authorization: `Bearer ${props.context?.STRIPE_KEY_ADMIN}` }
      }
    )
  ).json<{
    data: {
      id: string
      description: string
      quantity: number
      amount_total: number
    }[]
  }>()

  return json({ session, line_items })
}

export const meta: MetaFunction = () => ({
  title: `Thank you for your order!`
})

const PageThankYou: React.FC = () => {
  const { session, line_items } = useLoaderData<typeof loader>()

  useEffect(() => {
    localStorage.setItem('cakeOrders', JSON.stringify([]))
  }, [])

  return (
    <Layout navs={[]}>
      <div className='mx-auto max-w-2xl'>
        <h1 className='mb-4 text-2xl text-center'>
          {session.customer_details?.name}, thank you for your order!
        </h1>
        {session.payment_intent.description?.length ? (
          <p>{session.payment_intent.description}</p>
        ) : null}
        {session.payment_intent.metadata?.shipping_tracking ? (
          <p>
            <strong>PostNL tracking:</strong>{' '}
            <a
              className='border-b-2 border-spacing-2 border-neutral-700 border-dotted hover:border-solid'
              href={`https://jouw.postnl.nl/track-and-trace/${
                session.payment_intent.metadata?.shipping_tracking
              }-${
                session.shipping_details?.address?.country
              }-${session.shipping_details?.address?.postal_code?.replace(/\s/g, '')}`}
              target='_blank'
            >
              {session.payment_intent.metadata?.shipping_tracking}
            </a>
          </p>
        ) : null}
        <table className='w-full'>
          <tbody>
            <tr>
              <th className='p-1 text-left'>Item</th>
              <th className='p-1 text-center'>Quantity</th>
              <th className='p-1 text-right'>Price</th>
              <th className='p-1 text-right'>Amount</th>
            </tr>
            {line_items?.data?.map(item => (
              <tr
                key={item.id}
                className='border-t border-neutral-300 hover:bg-neutral-50 hover:cursor-pointer'
              >
                <td className='p-1'>{item.description}</td>
                <td className='p-1 text-center'>{item.quantity}</td>
                <td className='p-1 text-right'>
                  {full(item.amount_total / item.quantity / 10 / 10)}
                </td>
                <td className='p-1 text-right'>{full(item.amount_total / 10 / 10)}</td>
              </tr>
            ))}
            {session.shipping_options.length ? (
              <tr>
                <td colSpan={3} className='py-2 px-1 text-right'>
                  Shipping
                </td>
                <td className='py-2 px-1 text-right'>
                  {full(session.shipping_options[0].shipping_amount / 10 / 10)}
                </td>
              </tr>
            ) : null}
            <tr>
              <td colSpan={3} className='py-2 px-1 font-bold text-right'>
                Total
              </td>
              <td className='py-2 px-1 font-bold text-right'>
                {full(session.amount_total! / 10 / 10)}
              </td>
            </tr>
          </tbody>
        </table>
        {session.metadata && Object.keys(session.metadata).length ? (
          <table className='mt-8 w-full'>
            <tbody>
              {Object.keys(session.metadata).map((key, index) => (
                <tr key={index}>
                  <th className='text-left'>{key}:</th>
                  <td>{session.metadata?.[key]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    </Layout>
  )
}

export default PageThankYou
