import type { AppLoadContext } from 'react-router'
import { isPreviewRequest, requiredEnvValue } from './contentful'

export const getMyparcelAuthHeader = (
  context?: AppLoadContext,
  request?: Request
): { Authorization: string } => {
  const env = (context as any)?.cloudflare?.env
  const myparcelKey = requiredEnvValue(env, 'WEBHOOK_STRIPE_MYPARCEL_KEY', isPreviewRequest(request))
  return {
    Authorization: `bearer ${btoa(myparcelKey as string)}`
  }
}
