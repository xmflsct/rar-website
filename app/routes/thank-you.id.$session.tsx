import { json, LoaderArgs } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { useEffect } from 'react'
import Layout from '~/layout'
import { full } from '~/utils/currency'

export const loader = async (props: LoaderArgs) => {
  if (!props.params.session) {
    throw json('Not Found', { status: 404 })
  }

  const session = await (
    await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${props.params.session}`,
      {
        headers: { Authorization: `Bearer ${props.context.STRIPE_KEY_PRIVATE}` }
      }
    )
  ).json<{
    amount_total: number
    payment_status: 'paid' | 'unpaid'
    customer_details: { name: string }
    shipping_options: { shipping_amount: number }[]
    metadata: { [key: string]: string }
  }>()

  if (session.payment_status !== 'paid') {
    throw json('Not Paid', { status: 404 })
  }

  const line_items = await (
    await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${props.params.session}/line_items?limit=100`,
      {
        headers: { Authorization: `Bearer ${props.context.STRIPE_KEY_PRIVATE}` }
      }
    )
  ).json<{
    data: {
      id: string
      description: string
      quantity: number
      amount_total: number
      price: { metadata?: { description?: string } }
    }[]
  }>()

  return json({ session, line_items })
}

const PageThankYou: React.FC = () => {
  const { session, line_items } = useLoaderData<typeof loader>()

  useEffect(() => {
    localStorage.setItem('cakeOrders', JSON.stringify([]))
  }, [])

  return (
    <Layout navs={[]}>
      <div className='mx-auto max-w-xl'>
        <h1 className='mb-4 text-2xl text-center'>
          {session.customer_details.name}, thank you for your order!
        </h1>
        <table className='w-full'>
          <tbody>
            <tr>
              <th className='p-1 text-left'>Item</th>
              <th className='p-1 text-right'>Quantity</th>
              <th className='p-1 text-right'>Price</th>
              <th className='p-1 text-right'>Amount</th>
            </tr>
            {line_items?.data?.map(item => (
              <tr
                key={item.id}
                className='border-t border-neutral-300 hover:bg-neutral-50 hover:cursor-pointer'
              >
                <td className='p-1'>
                  <div>{item.description}</div>
                  {item.price.metadata?.description ? (
                    <div className='text-sm text-neutral-500'>
                      {item.price.metadata?.description}
                    </div>
                  ) : null}
                </td>
                <td className='p-1 text-right'>{item.quantity}</td>
                <td className='p-1 text-right'>
                  {full(item.amount_total / item.quantity / 10 / 10)}
                </td>
                <td className='p-1 text-right'>
                  {full(item.amount_total / 10 / 10)}
                </td>
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
                {full(session.amount_total / 10 / 10)}
              </td>
            </tr>
          </tbody>
        </table>
        {Object.keys(session.metadata).length ? (
          <table className='mt-8 w-full'>
            <tbody>
              {Object.keys(session.metadata).map((key, index) => (
                <tr key={index}>
                  <th className='text-left'>{key}:</th>
                  <td>{session.metadata[key]}</td>
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
