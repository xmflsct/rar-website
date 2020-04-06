const sgMail = require("@sendgrid/mail")
const ky = require("ky-universal")

async function checkRecaptcha(req) {
  if (!req.body.token)
    return {
      success: false,
      error: "[email order - checkRecaptcha] No token is provided",
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

async function sendGrid(req) {
  sgMail.setApiKey(process.env.SENDGRID_KEY)
  let message = {
    from: `${req.body.data.name} <${req.body.data.email}>`,
    to: "info@roundandround.nl",
    // replyTo: req.body.data.email,
    subject: `[2020] Birthday Cake Order - ${req.body.data.name}`,
    html: `<p>Name: ${req.body.data.name}</p>
      <p>Email: ${req.body.data.email}</p>
      <p>Phone: ${req.body.data.phone}</p>
      <p>Pick-up date: ${req.body.data.date}</p>
      <p>Pick-up time: ${req.body.data.time}</p>
      <p>Style: ${req.body.data.style}</p>
      <p>Size: ${req.body.data.size}</p>
      <p>Base: ${req.body.data.base}</p>
      <p>Filling: ${req.body.data.filling}</p>
      <p>Chocotag: ${req.body.data.chocotag}</p>
      <p>Notes: ${req.body.data.notes}</p>
      <p>Gift card: IPG000NU-${req.body.data.giftcard}</p>
      <p>Voucher: ${req.body.data.voucher}</p>`,
  }
  let response = {}
  await sgMail.send(message, (error, result) => {
    if (error) {
      console.log(error)
      response = { success: false, error: error }
    } else {
      console.log(result)
      response = { success: true }
    }
  })
  return response
}

export default async (req, res) => {
  console.log("[app] Start")
  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).send({ error: "[app] Content error" })
    return
  }

  console.log("[email order - checkRecaptcha] Start")
  const resRecaptcha = await checkRecaptcha(req)
  console.log("[email order - checkRecaptcha] End")
  if (!resRecaptcha.success) {
    res.status(400).send({ error: resRecaptcha.error })
    return
  }

  console.log("[email order - mailSession] Start")
  const resNodemailer = await sendGrid(req)
  console.log("[email order - mailSession] End")
  if (resNodemailer.success) {
    res.status(200).send({ success: true })
  } else {
    res.status(400).send({ error: resNodemailer.error })
    return
  }

  console.log("[app] End")
}
