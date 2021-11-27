import ky from 'ky-universal'

export async function checkout(params) {
  return await ky
    .post(window.location.origin + '/api/checkout', { json: params })
    .json()
}
