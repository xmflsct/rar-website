import { faStripe } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Dialog, Transition } from '@headlessui/react'
import { ActionArgs, LoaderArgs, V2_MetaFunction, json } from '@remix-run/cloudflare'
import { Form, Link, useActionData, useLoaderData, useNavigation } from '@remix-run/react'
import { loadStripe } from '@stripe/stripe-js'
import classNames from 'classnames'
import { addDays, getMonth, getYear } from 'date-fns'
import { gql } from 'graphql-request'
import countries from 'i18n-iso-countries'
import { sumBy } from 'lodash'
import { Fragment, useContext, useEffect, useState } from 'react'
import Button from '~/components/button'
import ExpandableField from '~/components/expandableField'
import OrderList from '~/components/orderList'
import PickDay, { closedDays, invalidDayBefore, isDayValid } from '~/components/pickDay'
import Select from '~/components/select'
import Layout from '~/layout'
import { BagContext, CakeOrder } from '~/states/bag'
import calShipping from '~/utils/calShipping'
import checkout from '~/utils/checkout'
import { DaysClosed, MaxCalendarMonth, Shipping, cacheQuery } from '~/utils/contentful'
import { full } from '~/utils/currency'
import { getAllPages } from '~/utils/kv'

countries.registerLocale(require('i18n-iso-countries/langs/en.json'))

export const loader = async ({ context, request }: LoaderArgs) => {
  const data = await cacheQuery<{
    shippingCollection: { items: Shipping[] }
    maxCalendarMonthCollection: { items: MaxCalendarMonth[] }
    daysClosedCollection: { items: DaysClosed[] }
  }>({
    context,
    request,
    ttlMinutes: 0,
    variables: { end_gte: new Date().toISOString() },
    query: gql`
      query Shipping($preview: Boolean, $end_gte: DateTime!) {
        shippingCollection(preview: $preview, limit: 1, where: { year: 2023 }) {
          items {
            rates
          }
        }
        maxCalendarMonthCollection(preview: $preview, limit: 1) {
          items {
            month
          }
        }
        daysClosedCollection(preview: $preview, where: { end_gte: $end_gte }) {
          items {
            start
            end
          }
        }
      }
    `
  })

  const { navs } = await getAllPages(context)
  return json({
    navs,
    shippingRates: data.shippingCollection.items[0].rates,
    maxCalendarMonth: data.maxCalendarMonthCollection.items[0].month,
    daysClosedCollection: data.daysClosedCollection.items
  })
}

export const action = async ({ context, request }: ActionArgs) => {
  const formData = await request.formData()
  const data = Object.fromEntries(formData)

  if (typeof data.pickup_date === 'string' && !isDayValid({ date: new Date(data.pickup_date) })) {
    return { error: 'Please select a new date', type: 'date' }
  }

  if (!data.orders) {
    return { error: 'No data was supplied', type: 'order' }
  }

  let parsedOrders
  try {
    parsedOrders = JSON.parse(data.orders.toString())
  } catch {
    return { error: 'Parsing orders failed', type: 'order' }
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

export const meta: V2_MetaFunction = () => [
  {
    title: `Shopping Bag | Round&Round Rotterdam`
  }
]

const ShoppingBag = () => {
  const { navs, shippingRates, maxCalendarMonth, daysClosedCollection } =
    useLoaderData<typeof loader>()
  const navigation = useNavigation()
  const { cakeOrders } = useContext(BagContext)
  const [ideal, setIdeal] = useState(true)
  const [paperBag, setPaperBag] = useState(true)
  const [countryCode, setCountryCode] = useState<string>('NLD')
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
    return (order[`type${order.chosen.unit}Price`] ?? 0) * order.chosen.amount
  })

  const { fee: shippingFee } = calShipping({
    rates: shippingRates,
    orders: orders.shipping,
    countryCode
  })

  const actionData = useActionData()
  const [actionError, setActionError] = useState<string | null>(null)
  useEffect(() => {
    if (actionData?.error) {
      setActionError(actionData.error)
      if (actionData.type === 'date') {
        setPickup(undefined)
      }
      return
    }

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

  // Only show pickup date when there are orders without specific pickup date
  const needPickup = orders.pickup.filter(p => p.chosen.delivery?.date === undefined).length

  return (
    <Layout navs={navs}>
      <Transition appear show={!!actionError} as={Fragment}>
        <Dialog as='div' className='relative z-10' onClose={() => setActionError(null)}>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black bg-opacity-25' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4 text-center'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-4 gap-4 flex flex-col items-center shadow-xl transition-all'>
                  <Dialog.Title as='h3' className='text-lg font-bold'>
                    {actionError}
                  </Dialog.Title>
                  <Button
                    className='border-red-500 text-red-500'
                    onClick={() => setActionError(null)}
                  >
                    Retry
                  </Button>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <h1 className='text-3xl mb-4'>Shopping bag</h1>
      {orders.pickup.length || orders.shipping.length ? (
        <Form method='post' className='grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-8'>
          <input
            type='hidden'
            name='success_url'
            value={`${typeof window !== 'undefined' && window.location.origin}/thank-you`}
          />
          <input
            type='hidden'
            name='cancel_url'
            value={`${typeof window !== 'undefined' && window.location.origin}/shopping-bag`}
          />
          <input type='hidden' name='orders' value={JSON.stringify(orders)} />

          <div className='lg:col-span-3 flex flex-col gap-4'>
            <h2 className='text-2xl'>Overview</h2>
            {orders.pickup.length ? (
              <div className='flex flex-col gap-4'>
                <h3 className='text-xl'>🛍️ Pickup orders</h3>
                {
                  // Only show pickup date when there are orders without specific pickup date
                  needPickup ? (
                    <div
                      className={`bg-neutral-100 rounded-tr-md rounded-br-md p-4 border-l-2 ${
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
                                (maxCalendarMonth >= getMonth(new Date()) ? 0 : 1),
                              maxCalendarMonth - 1
                            )
                          }
                          disabled={[...closedDays(daysClosedCollection), invalidDayBefore]}
                        />
                      </div>
                      <div className='text-sm mt-2 text-neutral-500'>
                        Pick up hours: <strong>12:00 - 18:00</strong>.<br />
                        We support min +2 days pick-up. If you have urgent order, you can always
                        drop by our shop to buy our daily cakes.
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
              <div className='flex flex-col gap-4'>
                <h3 className='text-xl'>📦 Shipping orders</h3>
                {orders.shipping.map(order => (
                  <OrderList key={order.sys.id} order={order} />
                ))}
              </div>
            ) : null}
          </div>

          <div className='lg:col-span-2 flex flex-col gap-4'>
            <fieldset>
              <h3 className='text-xl mb-2'>Processing fee</h3>
              <div className='flex'>
                <input
                  type='radio'
                  name='ideal'
                  checked={ideal}
                  onChange={e => setIdeal(e.target.value === 'on')}
                />
                <label className='pl-2 grow flex justify-between' onClick={() => setIdeal(true)}>
                  <span>iDeal</span>
                  <span>{full(0.3)}</span>
                </label>
              </div>
              <div className='flex'>
                <input
                  type='radio'
                  name='cards'
                  checked={!ideal}
                  onChange={e => setIdeal(e.target.value !== 'on')}
                />
                <label className='pl-2 grow flex justify-between' onClick={() => setIdeal(false)}>
                  <span>Cards, Apply Pay, Google Pay</span>
                  <span>{full(1)}</span>
                </label>
              </div>
            </fieldset>

            {orders.shipping.length ? (
              <fieldset>
                <h3 className='text-xl mb-2'>Ship to</h3>
                <Select
                  name='countryCode'
                  value={countryCode}
                  required
                  onChange={e => setCountryCode(e.target.value)}
                >
                  {shippingRates
                    .flatMap(rate => rate.countryCode)
                    .map(countryCode => (
                      <option value={countryCode} children={countries.getName(countryCode, 'en')} />
                    ))}
                </Select>
              </fieldset>
            ) : null}

            {needPickup ? (
              <fieldset>
                <div className='flex'>
                  <input
                    type='checkbox'
                    name={needPickup ? 'paperBag' : ''}
                    checked={paperBag}
                    onChange={() => setPaperBag(!paperBag)}
                  />
                  <label
                    className='pl-2 grow flex justify-between'
                    onClick={() => setPaperBag(!paperBag)}
                  >
                    <span>I need a paper bag</span>
                    <span>{full(0.5)}</span>
                  </label>
                </div>
              </fieldset>
            ) : null}

            <h2 className='text-2xl'>Summary</h2>
            <table>
              <tbody>
                <tr>
                  <th className='text-left pr-4'>Subtotal</th>
                  <td className='text-right'>
                    {full(subtotal)}
                    <input name='subtotal_amount' type='hidden' value={subtotal} />
                  </td>
                </tr>
                {orders.shipping.length ? (
                  <tr>
                    <th className='text-left pr-4'>Shipping fee</th>
                    <td className='text-right'>
                      {shippingFee === 0 ? 'Free' : full(shippingFee)}
                      <input name='shipping_amount' type='hidden' value={shippingFee} />
                    </td>
                  </tr>
                ) : null}
                <tr>
                  <th
                    className={classNames('text-left pr-4', !needPickup || !paperBag ? 'pb-2' : '')}
                  >
                    Processing fee
                  </th>
                  <td className={classNames('text-right', !needPickup || !paperBag ? 'pb-2' : '')}>
                    {full(ideal ? 0.3 : 1)}
                  </td>
                </tr>
                {needPickup && paperBag ? (
                  <tr>
                    <th className='text-left pr-4 pb-2'>Paper bag</th>
                    <td className='text-right pb-2'>{full(0.5)}</td>
                  </tr>
                ) : null}
                <tr className='border-t'>
                  <th className='text-left pr-4 pt-2'>Total</th>
                  <td className='text-right'>
                    {full(
                      subtotal +
                        (orders.shipping.length ? shippingFee : 0) +
                        (ideal ? 0.3 : 1) +
                        (needPickup && paperBag ? 0.5 : 0)
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
                    We will manually register your gift card's expense and refund the corresponding
                    amount to this payment.
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
                      We will manually validate your voucher code and refund the corresponding
                      amount to this payment.
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
                Orders have to be collected on your selected date and within the opening hours.
                <br />
                We cannot issue a refund or exchange for any uncollected cakes.
                <br />
                Orders CANNOT be exchanged, canceled or refunded after 48 hours before 11:00 am of
                the collection day.
              </div>
            </div>
            <Button type='submit' disabled={navigation.state === ('submitting' || 'loading')}>
              {navigation.state === 'submitting'
                ? '...'
                : navigation.state === 'loading'
                ? '...'
                : 'Checkout'}
            </Button>
            <div className='mt-4 text-sm'>
              <div className='flex flex-row items-center'>
                Payment provided by
                <FontAwesomeIcon icon={faStripe} size='3x' className='ml-2' />
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
