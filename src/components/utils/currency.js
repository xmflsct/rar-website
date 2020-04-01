export function short(amount) {
  return "€" + amount
}

export function full(amount) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR"
  }).format(amount)
}
