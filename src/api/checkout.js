export async function checkout(
  token,
  customer,
  items,
  metadata,
  url,
  shipping
) {
  let response = null
  try {
    response = await fetch(
      window.location.origin + "/api/checkout?token=" + token,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          customer: customer,
          items: items,
          metadata: metadata,
          url: url,
          shipping: shipping
        })
      }
    ).then(res => res.json())
  } catch (err) {
    response = err
  }
  return response
}
