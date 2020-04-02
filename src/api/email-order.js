import ky from "ky-universal"

export async function emailOrder(token, data) {
  return await ky
    .post(window.location.origin + "/api/email-order", {
      json: {
        token: token,
        data: data
      }
    })
    .json()
}
