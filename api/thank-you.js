const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)
const fetch = require("node-fetch")
var _ = require("lodash")

async function checkRecaptcha(req) {
  console.log("[checkout - checkRecaptcha] Start")
  if (!req.query.token)
    return {
      fail: true,
      error: "[checkout - checkRecaptcha] No token is provided"
    }
  const secret = process.env.RECAPTCHA_PRIVATE_SECRET
  const url =
    "https://www.google.com/recaptcha/api/siteverify?secret=" +
    secret +
    "&response=" +
    req.query.token +
    "&remoteip=" +
    req.connection.remoteAddress
  await fetch(url)
    .catch(err => {
      return { fail: true, error: err }
    })
    .then(res => {
      if (!res.ok)
        return {
          fail: true,
          error:
            "[checkout - checkRecaptcha] Google reCAPTCHA server responds error"
        }
      return res
    })
    .then(res => res.json())
    .then(json => {
      if (!json.success)
        return {
          fail: true,
          error:
            "[checkout - checkRecaptcha] Google reCAPTCHA could not verify user action"
        }
    })
  console.log("[checkout - checkRecaptcha] End")
  return { fail: false }
}

async function stripeSession(req) {
  console.log("[checkout - stripeSession] Start")
  const session = await stripe.checkout.sessions.retrieve(req.body.sessionId)
  if (session.id === req.body.sessionId) {
    const data = {
      email: session.customer_email,
      things: session.display_items
    }
    console.log("[checkout - stripeSession] End")
    return { fail: false, data: data }
  } else {
    console.log("[checkout - stripeSession] End")
    return {
      fail: true,
      error: "[checkout - stripeSession] Failed retrieving session"
    }
  }
}

export default async (req, res) => {
  console.log("[app] Start")
  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).send({ error: "[app] Body empty or error" })
    return
  }

  const resRecaptcha = await checkRecaptcha(req)
  if (resRecaptcha.fail) {
    res.status(400).send({ error: resRecaptcha.error })
    return
  }

  const resStripe = await stripeSession(req)
  if (!resStripe.fail) {
    res.status(200).send({ data: resStripe.data })
  } else {
    res.status(400).send({ error: resStripe.error })
    return
  }

  console.log("[app] End")
}
