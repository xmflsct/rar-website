import ky from 'ky-universal'

export async function fullmoon ({ quantity, date, email, phone, notes }) {
  const url = {
    success: window.location.origin + '/thank-you',
    cancel: window.location.origin + '/full-moon-box'
  }

  return await ky
    .post(window.location.origin + '/api/fullmoon', {
      json: { quantity, date, email, phone, notes, url }
    })
    .json()
}
