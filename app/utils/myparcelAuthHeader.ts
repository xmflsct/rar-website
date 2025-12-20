import type { AppLoadContext } from 'react-router'
import { data } from 'react-router'

export const getMyparcelAuthHeader = (context?: AppLoadContext): { Authorization: string } => {
  const env = (context as any)?.cloudflare?.env
  const myparcelKey = env?.WEBHOOK_STRIPE_MYPARCEL_KEY
  if (!myparcelKey) {
    throw data('Missing MyParcel key', { status: 500 })
  }
  return {
    Authorization: `bearer ${btoa(myparcelKey as string)}`
  }
}
