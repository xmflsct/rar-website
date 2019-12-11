export async function order_request_sendgrid(
  token,
  email,
  subject,
  content,
  name,
  phone,
  datetime,
) {
  await fetch("https://us-central1-rar-api.cloudfunctions.net/order_request_sendgrid", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      token: token,
      email: email,
      subject: subject,
      content: content,
      name: name,
      phone: phone,
      datetime: datetime
    })
  }).then(response => {
    if (response.status === 200) {
      return Promise.resolve();
    } else {
      return Promise.reject();
    }
  });
}
