export async function order_request_sendgrid(
  token,
  email,
  subject,
  content,
  name,
  phone,
  datetime,
) {
  await fetch('https://api.roundandround.nl/order/request/sendgrid', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token,
      email,
      subject,
      content,
      name,
      phone,
      datetime,
    }),
  }).then((response) => {
    if (response.status === 200) {
      return Promise.resolve();
    } else {
      return Promise.reject();
    }
  });
}
