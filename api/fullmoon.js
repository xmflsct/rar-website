const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)
const ky = require('ky-universal')
var _ = require('lodash')

async function checkAmount ({ body: { quantity, date } }) {
  const line_items = []

  line_items.push({
    name: 'Full Moon Box',
    amount: 2100,
    currency: 'eur',
    quantity
  })
  line_items.push({
    name: `Shipping ${date}`,
    amount: 500,
    currency: 'eur',
    quantity: 1
  })

  return { success: true, line_items }
}

async function stripeSession (
  { body: { phone, email, notes, url } },
  line_items
) {
  const sessionData = {
    payment_method_types: ['ideal'],
    customer_email: email,
    line_items,
    shipping_address_collection: {
      allowed_countries: ['NL']
    },
    success_url: url.success + '?session_id={CHECKOUT_SESSION_ID}',
    cancel_url: url.cancel,
    payment_intent_data: {
      metadata: { phone, notes }
    }
  }

  console.log('[checkout - stripeSession] Initialize stripe session')
  const session = await stripe.checkout.sessions.create(sessionData)
  if (session.id) {
    return { success: true, sessionId: session.id }
  } else {
    console.log('[checkout - stripeSession] End')
    return {
      success: false,
      error: '[checkout - stripeSession] Failed creating session'
    }
  }
}

export default async (req, res) => {
  console.log('[app] Start')
  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).send({ error: '[app] Content error' })
    return
  }

  console.log('[checkout - checkAmount] Start')
  const resAmount = await checkAmount(req)
  console.log('[checkout - checkAmount] End')
  if (!resAmount.success) {
    res.status(400).send({ error: resAmount.error })
    return
  }

  console.log('[checkout - stripeSession] Start')
  const resStripe = await stripeSession(req, resAmount.line_items)
  console.log('[checkout - stripeSession] End')
  if (resStripe.success) {
    res.status(200).send({ sessionId: resStripe.sessionId })
  } else {
    res.status(400).send({ error: resStripe.error })
    return
  }

  console.log('[app] End')
}
