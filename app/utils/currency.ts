export const short = (amount: number) => {
  return `€ ${amount}`
}

export const full = (amount: number) => {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}
