const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)
const ky = require("ky-universal")
var _ = require("lodash")

async function checkRecaptcha(req) {
  if (!req.body.token)
    return {
      success: false,
      error: "[checkout - checkRecaptcha] No token is provided",
    }

  return await ky
    .get("https://www.google.com/recaptcha/api/siteverify", {
      searchParams: {
        secret: process.env.RECAPTCHA_PRIVATE_KEY,
        response: req.body.token,
        remoteip: req.connection.remoteAddress,
      },
    })
    .json()
}

async function checkContentful(req) {
  if (req.body.items.length === 0)
    return {
      success: false,
      error: "[checkout - checkContentful] Content error",
    }

  const url =
    "https://" +
    process.env.CONTENTFUL_HOST +
    "/spaces/" +
    process.env.CONTENTFUL_SPACE +
    "/environments/" +
    process.env.CONTENTFUL_ENVIRONMENT +
    "/entries/"
  const line_items = req.body.items
  let ids = []
  for (const item of line_items) {
    ids.push(item.contentful_id)
  }
  ids = ids.join(",")
  const response = await ky
    .get(url, {
      searchParams: {
        access_token: process.env.CONTENTFUL_KEY_CHECKOUT,
        content_type: "cakesCake",
        "sys.id[in]": ids,
      },
    })
    .json()

  if (!response.hasOwnProperty("items")) {
    return {
      success: false,
      error: "[checkout - checkContentful] Content error",
    }
  }

  for (const item of line_items) {
    const iContentful = _.findIndex(response.items, (r) => {
      return r.sys.id === item.contentful_id
    })
    if (
      item.amount === response.items[iContentful].fields["price" + item.type]
    ) {
      item.amount = item.amount * 10 * 10
      item.currency = "eur"
      const thingIdentity =
        item.type === "Whole" ? " " + item.wholeIdentity : " Piece"
      item.name =
        response.items[iContentful].fields.name + " | " + thingIdentity
      item.type === "Whole" && delete item.wholeIdentity
      delete item.type
      delete item.contentful_id
    } else {
      return {
        success: false,
        error: "[checkout - checkContentful] Submitted price error",
      }
    }
  }

  return { success: true, line_items: line_items }
}

async function stripeSession(req, line_items) {
  let sessionData = {}
  try {
    sessionData = req.body.shipping
      ? {
          payment_method_types: ["ideal"],
          customer_email: req.body.customer.email,
          line_items: line_items,
          shipping_address_collection: {
            allowed_countries: ["NL"],
          },
          success_url:
            req.body.url.success + "?session_id={CHECKOUT_SESSION_ID}",
          cancel_url: req.body.url.cancel,
          payment_intent_data: {
            metadata: req.body.metadata,
          },
        }
      : {
          payment_method_types: ["ideal"],
          customer_email: req.body.customer.email,
          line_items: req.body.items,
          success_url:
            req.body.url.success + "?session_id={CHECKOUT_SESSION_ID}",
          cancel_url: req.body.url.cancel,
          payment_intent_data: {
            metadata: req.body.metadata,
          },
        }
  } catch (err) {
    return { success: false, error: err }
  }
  console.log("[checkout - stripeSession] Initialize stripe session")
  const session = await stripe.checkout.sessions.create(sessionData)
  if (session.id) {
    return { success: true, sessionId: session.id }
  } else {
    console.log("[checkout - stripeSession] End")
    return {
      success: false,
      error: "[checkout - stripeSession] Failed creating session",
    }
  }
}

export default async (req, res) => {
  console.log("[app] Start")
  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).send({ error: "[app] Content error" })
    return
  }

  console.log("[checkout - checkRecaptcha] Start")
  const resRecaptcha = await checkRecaptcha(req)
  console.log("[checkout - checkRecaptcha] End")
  if (!resRecaptcha.success) {
    res.status(400).send({ error: resRecaptcha.error })
    return
  }

  console.log("[checkout - checkContentful] Start")
  const resContentful = await checkContentful(req)
  console.log("[checkout - checkContentful] End")
  if (!resContentful.success) {
    res.status(400).send({ error: resContentful.error })
    return
  }

  console.log("[checkout - stripeSession] Start")
  const resStripe = await stripeSession(req, resContentful.line_items)
  console.log("[checkout - stripeSession] End")
  if (resStripe.success) {
    res.status(200).send({ sessionId: resStripe.sessionId })
  } else {
    res.status(400).send({ error: resStripe.error })
    return
  }

  console.log("[app] End")
}
