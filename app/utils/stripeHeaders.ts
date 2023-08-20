export const getStripeHeaders = (key: string | unknown): HeadersInit => ({
  Authorization: `Bearer ${key}`,
  'Stripe-Version': '2023-08-16'
})
