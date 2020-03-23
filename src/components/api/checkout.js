export async function checkout(token, customer, items, metadata, url, shipping) {
  const res = await fetch("https://api.roundandround.nl/checkout?key=AIzaSyBMgqjqljsjCe6aq-B5-JQZ6eNzv5m8JhI", {
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
