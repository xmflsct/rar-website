export async function checkout(token, customer, items, metadata, url, shipping) {
  const res = await fetch("https://api.roundandround.nl/checkout?key=AIzaSyCZ6M51YQ4tLLZoCRej06hPxywEUJvDxGg", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      token: token,
      customer: customer,
      items: items,
      metadata: metadata,
      url: url,
      shipping: shipping
    })
  }).then(res => res.json().then(data => ({ ok: res.ok, body: data })));

  return res;
}
