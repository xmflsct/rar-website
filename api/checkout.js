const stripe = require("stripe")(process.env.STRIPE_PRIVATE_SECRET)
const express = require("express")
const asyncHandler = require("express-async-handler")
const fetch = require("node-fetch")

async function checkRecaptcha(req) {
  console.log("[checkout - checkRecaptcha] Start")
  const secret = process.env.RECAPTCHA_PRIVATE_SECRET
  const url =
    "https://www.google.com/recaptcha/api/siteverify?secret=" +
    secret +
    "&response=" +
    req.body.token +
    "&remoteip=" +
    req.connection.remoteAddress
  await fetch(url)
    .catch(() => {
      throw new Error(
        "[checkout - checkRecaptcha] Google reCAPTCHA did not respond"
      )
    })
    .then(res => {
      if (!res.ok)
        throw new Error(
          "[checkout - checkRecaptcha] Google reCAPTCHA server responds error"
        )
      return res
    })
    .then(res => res.json())
    .then(json => {
      if (!json.success)
        throw new Error(
          "[checkout - checkRecaptcha] Google reCAPTCHA could not verify user action"
        )
    })
  console.log("[checkout - checkRecaptcha] End")
}

async function checkContentful(req) {
  console.log("[checkout - checkContentful] Start")
  if (req.body.items.length === 0)
    throw new Error("[checkout - checkContentful] Content error")
  let url = "https://" + process.env.CONTENTFUL_HOST
  const space = process.env.CONTENTFUL_SPACE
  const secret = process.env.CONTENTFUL_KEY_CHECKOUT
  const environment = process.env.CONTENTFUL_ENVIRONMENT
  let skus = []
  for (const item of req.body.items) {
    skus.push(item.description)
  }
  skus = skus.join(",")
  url =
    url +
    "/spaces/" +
    space +
    "/environments/" +
    environment +
    "/entries/?access_token=" +
    secret +
    "&content_type=webshopItem&fields.sku[in]=" +
    skus
  await fetch(url)
    .catch(() => {
      throw new Error(
        "[checkout - checkContentful] Contentful server did not respond"
      )
    })
    .then(res => {
      if (!res.ok)
        throw new Error(
          "[checkout - checkContentful] Contentful server responds error"
        )
      return res
    })
    .then(res => res.json())
    .then(json => {
      for (const item of json.items) {
        if (item.fields.priceSale) {
          contentfulPrice = item.fields.priceSale
        } else {
          contentfulPrice = item.fields.priceOriginal
        }

        if (
          req.body.items[
            req.body.items.findIndex(i => i.description === item.fields.sku)
          ].amount !== contentfulPrice
        )
          throw new Error("[checkout - checkContentful] Submitted price error")
      }
    })
  console.log("[checkout - checkContentful] End")
}

async function stripeSession(req, res) {
  console.log("[checkout - stripeSession] Start")
  var sessionData = {}
  try {
    sessionData = req.body.shipping
      ? {
          payment_method_types: ["ideal"],
          customer_email: req.body.customer.email,
          line_items: req.body.items,
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
    throw new Error("[checkout - stripeSession] Content error")
  }
  console.log("[checkout - stripeSession] Initialize stripe session")
  const session = await stripe.checkout.sessions.create(sessionData)
  res.status(200).send({ sessionId: session.id })
  console.log("[checkout - stripeSession] End")
}

const app = express()
app.use(express.json())
app.post(
  "/",
  asyncHandler(async (req, res) => {
    console.log("[app] Start")
    if (!req.is("application/json") || !req.body.token) {
      throw new Error("[app] Content error")
    }

    await checkRecaptcha(req)
    await checkContentful(req)
    await stripeSession(req, res)
    console.log("[app] End")
  })
)

module.exports = {
  app
}
