import type { EntryContext } from '@remix-run/cloudflare'
import { RemixServer } from '@remix-run/react'
import * as Sentry from '@sentry/remix'
import * as Tracing from '@sentry/tracing'
import { renderToString } from 'react-dom/server'

Sentry.init({
  dsn: 'https://79b2ce77fbfc4511af541c7a4cf125d3@o389581.ingest.sentry.io/6617177',
  tracesSampleRate: 0.5,
  integrations: [new Tracing.Integrations.Apollo()]
})

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  let markup = renderToString(
    <RemixServer context={remixContext} url={request.url} />
  )

  responseHeaders.set('Content-Type', 'text/html')

  return new Response('<!DOCTYPE html>' + markup, {
    status: responseStatusCode,
    headers: responseHeaders
  })
}
