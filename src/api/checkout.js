import ky from "ky-universal"

export async function checkout(
  token,
  customer,
  items,
  metadata,
  url,
  shipping
) {
  return await ky
    .post(window.location.origin + "/api/checkout", {
      json: {
        token: token,
        customer: customer,
        items: items,
        metadata: metadata,
        url: url,
        shipping: shipping
      }
    })
    .json()
}
