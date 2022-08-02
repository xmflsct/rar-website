import { faStripe, faIdeal } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ActionArgs, json, LoaderArgs } from '@remix-run/cloudflare'
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useTransition
} from '@remix-run/react'
import { loadStripe } from '@stripe/stripe-js'
import { addDays, getMonth, getYear } from 'date-fns'
import { gql } from 'graphql-request'
import { sumBy } from 'lodash'
import { useContext, useEffect, useState } from 'react'
import Button from '~/components/button'
import ExpandableField from '~/components/expandableField'
import OrderList from '~/components/orderList'
import PickDay, { SHOP_CLOSED_DAYS } from '~/components/pickDay'
import Layout from '~/layout'
import { BagContext, CakeOrder } from '~/states/bag'
import calShipping from '~/utils/calShipping'
import checkout from '~/utils/checkout'
import { cacheQuery, MaxCalendarMonth, Shipping } from '~/utils/contentful'
import { full } from '~/utils/currency'
import { getAllPages } from '~/utils/kv'

export const loader = async ({ context, request }: LoaderArgs) => {
  const data = await cacheQuery<{
    shippingCollection: { items: Shipping[] }
    maxCalendarMonthCollection: { items: MaxCalendarMonth[] }
  }>({
    context,
    request,
    ttlMinutes: 60 * 24 * 7,
    query: gql`
      query Shipping($preview: Boolean) {
        shippingCollection(preview: $preview, limit: 1, where: { year: 2022 }) {
          items {
            rates
          }
        }
        maxCalendarMonthCollection(preview: $preview, limit: 1) {
          items {
            month
          }
        }
      }
    `
  })

  const { navs } = await getAllPages(context)
  return json({
    navs,
    shippingRates: data.shippingCollection.items[0].rates,
    maxCalendarMonth: data.maxCalendarMonthCollection.items[0].month
  })
}

export const action = async ({ context, request }: ActionArgs) => {
  const formData = await request.formData()
  const data = Object.fromEntries(formData)

  if (!data.orders) {
    return { error: 'No data was supplied' }
  }

  let parsedOrders
  try {
    parsedOrders = JSON.parse(data.orders.toString())
  } catch {
    return { error: 'Parsing orders failed' }
  }

  const res = (await checkout({
    context,
    content: { ...data, orders: parsedOrders }
  })) as any
  if (res?.id) {
    return res.id
  } else {
    return null
  }
}

const ShoppingBag = () => {
  const { navs, shippingRates, maxCalendarMonth } =
    useLoaderData<typeof loader>()
  const transition = useTransition()
  const { cakeOrders } = useContext(BagContext)
  const [pickup, setPickup] = useState<Date>()
  const [notes, setNotes] = useState<string>()
  const [terms, setTerms] = useState(false)

  // Conditions
  let hasBirthdayCake = false

  const orders = cakeOrders.reduce(
    (final: { pickup: CakeOrder[]; shipping: CakeOrder[] }, current) => {
      if (current.chosen.delivery?.type === 'shipping') {
        final.shipping.push(current)
      } else {
        final.pickup.push(current)
      }

      if (current.slug.includes('birthday-cake')) {
        hasBirthdayCake = true
      }

      return final
    },
    { pickup: [], shipping: [] }
  )

  const subtotal = sumBy(cakeOrders, order => {
    let sum = 0
    if (order.typeAPrice && order.chosen.typeAAmount) {
      sum = sum + order.typeAPrice * order.chosen.typeAAmount
    }
    if (order.typeBPrice && order.chosen.typeBAmount) {
      sum = sum + order.typeBPrice * order.chosen.typeBAmount
    }
    if (order.typeCPrice && order.chosen.typeCAmount) {
      sum = sum + order.typeCPrice * order.chosen.typeCAmount
    }
    return sum
  })

  const shippingFee = calShipping({
    rates: shippingRates,
    orders: orders.shipping
  })

  const excludeDates = []
  for (let i = 0; i < 31; i++) {
    const weekday = new Date(2021, 10, i).getDay()
    if (weekday === 1 || weekday === 2) {
      excludeDates.push(new Date(2021, 10, i))
    }
  }
  for (let i = 0; i < 25; i++) {
    const weekday = new Date(2021, 11, i).getDay()
    if (weekday === 1 || weekday === 2) {
      excludeDates.push(new Date(2021, 11, i))
    }
  }

  const actionData = useActionData()
  useEffect(() => {
    // @ts-ignore
    const stripePromise = loadStripe(window.ENV.STRIPE_KEY_PUBLIC)
    const redirect = async (id: string) => {
      const stripe = await stripePromise
      return await stripe?.redirectToCheckout({ sessionId: id })
    }
    if (actionData) {
      if (typeof actionData !== 'string') {
        console.warn(actionData)
      } else {
        redirect(actionData)
      }
    }
  }, [actionData])

  return (
    <Layout navs={navs}>
      <h1 className='text-3xl mb-4'>Shopping bag</h1>
      {orders.pickup.length || orders.shipping.length ? (
        <Form
          method='post'
          className='grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-8'
        >
          <input
            type='hidden'
            name='success_url'
            value={`${
              typeof window !== 'undefined' && window.location.origin
            }/thank-you`}
          />
          <input
            type='hidden'
            name='cancel_url'
            value={`${
              typeof window !== 'undefined' && window.location.origin
            }/shopping-bag`}
          />
          <input type='hidden' name='orders' value={JSON.stringify(orders)} />

          <div className='lg:col-span-3 flex flex-col gap-4'>
            <h2 className='text-2xl'>Overview</h2>
            {orders.pickup.length ? (
              <div className='flex flex-col gap-2'>
                <h3 className='text-xl'>🛍️ Pickup orders</h3>
                {
                  // Only show pickup date when there are orders without specific pickup date
                  orders.pickup.filter(
                    p => p.chosen.delivery?.date === undefined
                  ).length ? (
                    <div
                      className={`bg-neutral-100 rounded-tr-md rounded-br-md p-4 mb-2 border-l-2 ${
                        pickup ? 'border-green-500' : 'border-red-500'
                      }`}
                    >
                      <div className='flex flex-row items-center'>
                        <div>Pickup date: </div>
                        <PickDay
                          name='pickup_date'
                          date={pickup}
                          setDate={setPickup}
                          required
                          defaultMonth={addDays(new Date(), 2)}
                          fromMonth={addDays(new Date(), 2)}
                          toMonth={
                            new Date(
                              getYear(new Date()) +
                                (maxCalendarMonth >= getMonth(new Date())
                                  ? 0
                                  : 1),
                              maxCalendarMonth - 1
                            )
                          }
                          disabled={[
                            SHOP_CLOSED_DAYS,
                            {
                              before:
                                parseInt(
                                  new Date().toLocaleString('nl-NL', {
                                    hour: '2-digit',
                                    hour12: false,
                                    timeZone: 'Europe/Amsterdam'
                                  })
                                ) > 16
                                  ? addDays(new Date(), 3)
                                  : addDays(new Date(), 2)
                            }
                          ]}
                        />
                      </div>
                      <div className='text-sm mt-2 text-neutral-500'>
                        Pick up hours: <strong>12:00 - 18:00</strong>.<br />
                        We support min +2 days pick-up. If you have urgent
                        order, you can always drop by our shop to buy our daily
                        cakes.
                      </div>
                    </div>
                  ) : null
                }
                {orders.pickup.map(order => (
                  <OrderList key={order.sys.id} order={order} />
                ))}
              </div>
            ) : null}
            {orders.shipping.length ? (
              <div className='flex flex-col gap-2'>
                <h3 className='text-xl'>📦 Shipping orders</h3>
                {orders.shipping.map(order => (
                  <OrderList key={order.sys.id} order={order} />
                ))}
              </div>
            ) : null}
          </div>
          <div className='lg:col-span-2 flex flex-col gap-4'>
            <h2 className='text-2xl'>Summary</h2>
            <table>
              <tbody>
                <tr>
                  <th className='text-left pr-4'>Subtotal</th>
                  <td>
                    {full(subtotal)}
                    <input
                      name='subtotal_amount'
                      type='hidden'
                      value={subtotal}
                    />
                  </td>
                </tr>
                {orders.shipping.length ? (
                  <tr>
                    <th className='text-left pr-4'>Shipping fee</th>
                    <td>
                      {shippingFee === 0 ? 'Free' : full(shippingFee)}
                      <input
                        name='shipping_amount'
                        type='hidden'
                        value={shippingFee}
                      />
                    </td>
                  </tr>
                ) : null}
                <tr>
                  <th className='text-left pr-4 pb-2'>Transaction fee</th>
                  <td>{full(0.3)}</td>
                </tr>
                <tr className='border-t'>
                  <th className='text-left pr-4 pt-2'>Total</th>
                  <td>
                    {full(
                      subtotal +
                        (orders.shipping.length ? shippingFee : 0) +
                        0.3
                    )}
                  </td>
                </tr>
              </tbody>
            </table>

            <ExpandableField
              name='Notes'
              optional
              state={notes && notes.length ? 'positive' : undefined}
              children={
                <textarea
                  name='notes'
                  rows={2}
                  className='w-full border border-neutral-500 py-1 px-2'
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              }
            />
            <ExpandableField
              name='Redeem gift card'
              optional
              children={
                <>
                  <div className="before:content-['IPG000NU'] p-2">
                    <input
                      name='gift_card'
                      type='text'
                      placeholder='******'
                      className='ml-1 border-b border-neutral-500 bg-transparent'
                    />
                  </div>
                  <div className='text-sm text-neutral-600 p-2'>
                    We will manually register your gift card's expense and
                    refund the corresponding amount to this payment.
                  </div>
                </>
              }
            />
            {hasBirthdayCake && (
              <ExpandableField
                name='Birthday cake voucher'
                optional
                children={
                  <>
                    <div className="before:content-['IPG000NU'] p-2">
                      <input
                        name='birthday_cake_voucher'
                        type='text'
                        placeholder='******'
                        className='ml-1 border-b border-neutral-500 bg-transparent'
                      />
                    </div>
                    <div className='text-sm text-neutral-600 p-2'>
                      We will manually validate your voucher code and refund the
                      corresponding amount to this payment.
                    </div>
                  </>
                }
              />
            )}

            <div className='flex flex-col gap-1'>
              <div onClick={() => setTerms(!terms)} className='cursor-pointer'>
                <input
                  name='terms'
                  type='checkbox'
                  checked={terms}
                  onChange={() => setTerms(!terms)}
                  required
                  className='mr-2'
                />
                I have read and understood the cancellation policy
              </div>
              <div className='text-sm text-neutral-500 px-2'>
                Orders have to be collected on your selected date and within the
                opening hours.
                <br />
                We cannot issue a refund or exchange for any uncollected cakes.
                <br />
                Orders CANNOT be exchanged, canceled or refunded after 48 hours
                before 11:00 am of the collection day.
              </div>
            </div>
            <Button
              type='submit'
              disabled={transition.state === ('submitting' || 'loading')}
            >
              {transition.state === 'submitting'
                ? '...'
                : transition.state === 'loading'
                ? '...'
                : 'Checkout'}
            </Button>
            <div className='mt-4 text-sm'>
              <div className='flex flex-row items-center'>
                Payment provided by
                <FontAwesomeIcon icon={faStripe} size='3x' className='ml-2' />
              </div>
              <div className='flex flex-row items-center'>
                We support
                <FontAwesomeIcon icon={faIdeal} size='3x' className='ml-2' />
              </div>
            </div>
          </div>
        </Form>
      ) : (
        <Link to='/' className='text-xl'>
          Take a look at our online cake ordering?
        </Link>
      )}
    </Layout>
  )
}

export default ShoppingBag
