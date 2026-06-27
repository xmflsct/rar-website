import type { LoaderFunctionArgs } from 'react-router'
import { getCloudflareContext } from './cloudflare'
import { isPreviewRequest, requiredEnvValue } from './contentful'

export const getMyparcelAuthHeader = (
  context?: LoaderFunctionArgs['context'],
  request?: Request
): { Authorization: string } => {
  const env = getCloudflareContext(context)?.env
  const myparcelKey = requiredEnvValue(env, 'WEBHOOK_STRIPE_MYPARCEL_KEY', isPreviewRequest(request))
  return {
    Authorization: `bearer ${btoa(myparcelKey as string)}`
  }
}
