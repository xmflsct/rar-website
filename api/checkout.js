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

async function checkContentful(req) {
  console.log("[checkout - checkContentful] Start")
  if (req.body.items.length === 0)
    return { fail: true, error: "[checkout - checkContentful] Content error" }
  const line_items = req.body.items
  let url = "https://" + process.env.CONTENTFUL_HOST
  const space = process.env.CONTENTFUL_SPACE
  const secret = process.env.CONTENTFUL_KEY_CHECKOUT
  const environment = process.env.CONTENTFUL_ENVIRONMENT
  let ids = []
  for (const item of line_items) {
    ids.push(item.contentful_id)
  }
  ids = ids.join(",")
  url =
    url +
    "/spaces/" +
    space +
    "/environments/" +
    environment +
    "/entries/?access_token=" +
    secret +
    "&content_type=cakesCake&sys.id[in]=" +
    ids
  await fetch(url)
    .catch(() => {
      return {
        fail: true,
        error: "[checkout - checkContentful] Contentful server did not respond"
      }
    })
    .then(res => {
      if (!res.ok)
        return {
          fail: true,
          error: "[checkout - checkContentful] Contentful server responds error"
        }
      return res
    })
    .then(res => res.json())
    .then(json => {
      for (const item of line_items) {
        const iContentful = _.findIndex(json.items, r => {
          return r.sys.id === item.contentful_id
        })
        if (
          item.amount === json.items[iContentful].fields["price" + item.type]
        ) {
          item.amount = parseInt(item.amount * 100)
          item.currency = "eur"
          const thingIdentity =
            item.type === "Whole" ? " " + item.wholeIdentity : " Piece"
          item.name =
            json.items[iContentful].fields.name +
            " , " +
            item.quantity +
            thingIdentity
          item.type === "Whole" && delete item.wholeIdentity
          delete item.type
          delete item.contentful_id
        } else {
          return {
            fail: true,
            error: "[checkout - checkContentful] Submitted price error"
          }
        }
      }
    })
  console.log("[checkout - checkContentful] End")
  return { fail: false, line_items: line_items }
}

async function stripeSession(req, line_items) {
  console.log("[checkout - stripeSession] Start")
  let sessionData = {}
  try {
    sessionData = req.body.shipping
      ? {
          payment_method_types: ["ideal"],
          customer_email: req.body.customer.email,
          line_items: line_items,
          shipping_address_collection: {
            allowed_countries: ["NL"]
          },
          success_url:
            req.body.url.success + "?session_id={CHECKOUT_SESSION_ID}",
          cancel_url: req.body.url.cancel,
          payment_intent_data: {
            metadata: req.body.metadata
          }
        }
      : {
          payment_method_types: ["ideal"],
          customer_email: req.body.customer.email,
          line_items: req.body.items,
          success_url:
            req.body.url.success + "?session_id={CHECKOUT_SESSION_ID}",
          cancel_url: req.body.url.cancel,
          payment_intent_data: {
            metadata: req.body.metadata
          }
        }
  } catch (err) {
    return { fail: true, error: err }
  }
  console.log("[checkout - stripeSession] Initialize stripe session")
  const session = await stripe.checkout.sessions.create(sessionData)
  if (session.id) {
    console.log("[checkout - stripeSession] End")
    return { fail: false, sessionId: session.id }
  } else {
    console.log("[checkout - stripeSession] End")
    return {
      fail: true,
      error: "[checkout - stripeSession] Failed creating session"
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

  const resContentful = await checkContentful(req)
  if (resContentful.fail) {
    res.status(400).send({ error: resContentful.error })
    return
  }

  const resStripe = await stripeSession(req, resContentful.line_items)
  if (resStripe.sessionId) {
    res.status(200).send({ sessionId: resStripe.sessionId })
  } else {
    res.status(400).send({ error: resStripe.error })
    return
  }

  console.log("[app] End")
}
