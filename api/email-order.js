const nodemailer = require("nodemailer")
const ky = require("ky-universal")

async function checkRecaptcha(req) {
  if (!req.body.token)
    return {
      success: false,
      error: "[email order - checkRecaptcha] No token is provided"
    }

  return await ky
    .get("https://www.google.com/recaptcha/api/siteverify", {
      searchParams: {
        secret: process.env.RECAPTCHA_PRIVATE_KEY,
        response: req.body.token,
        remoteip: req.connection.remoteAddress
      }
    })
    .json()
}

async function mailSession(req) {
  let transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 465,
    secure: true,
    auth: {
      user: "shop@roundandround.nl",
      pass: process.env.ZOHO_PASSWORD
    }
  })

  let message = {
    from: '"Round&Round Rotterdam" <shop@roundandround.nl>',
    to: "info@roundandround.nl",
    replyTo: req.body.data.email,
    subject: "[2020] Birthday Cake Order",
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
      <p>Notes: ${req.body.data.notes}</p>`
  }

  const response = await transporter.sendMail(message)
  return {
    success: response.accepted.length > 0,
    response: response.response,
    messageId: response.messageId
  }
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
  const resNodemailer = await mailSession(req)
  console.log("[email order - mailSession] End")
  if (resNodemailer.success) {
    res.status(200).send({ messageId: resNodemailer.messageId })
  } else {
    res.status(400).send({ error: resNodemailer.response })
    return
  }

  console.log("[app] End")
}
