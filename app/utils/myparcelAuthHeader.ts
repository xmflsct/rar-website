import { AppLoadContext, json } from '@remix-run/cloudflare'

export const getMyparcelAuthHeader = (context?: AppLoadContext): { Authorization: string } => {
  const myparcelKey = context?.WEBHOOK_STRIPE_MYPARCEL_KEY
  if (!myparcelKey) {
    throw json('Missing MyParcel key', { status: 500 })
  }
  return {
    Authorization: `bearer ${btoa(myparcelKey as string)}`
  }
}
