import { createRequestHandler, logDevReady } from '@remix-run/cloudflare'
import * as build from '@remix-run/dev/server-build'

if (process.env.NODE_ENV === 'development') {
  logDevReady(build)
}

const handleRequest = createRequestHandler(build, process.env.NODE_ENV)

export default {
  async fetch(request: Request, env: Record<string, unknown>, ctx: ExecutionContext) {
    return handleRequest(request, {
      ...env,
      waitUntil: ctx.waitUntil.bind(ctx),
    })
  },
}
