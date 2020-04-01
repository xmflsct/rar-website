export async function thankYou(token, sessionId) {
  let response = null
  try {
    response = await fetch(
      window.location.origin + "/api/thank-you?token=" + token,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sessionId: sessionId
        })
      }
    ).then(res => res.json())
  } catch (err) {
    response = err
  }
  return response
}
