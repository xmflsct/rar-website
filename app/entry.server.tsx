import { Request } from '@cloudflare/workers-types'
import type { EntryContext } from '@remix-run/cloudflare'
import { RemixServer } from '@remix-run/react'
import { renderToReadableStream } from 'react-dom/server'
import { cached } from './utils/contentful'
import { kved } from './utils/kv'

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const body = await renderToReadableStream(
    <RemixServer context={remixContext} url={request.url} />,
    {
      onError(error: unknown) {
        console.error(error)
        responseStatusCode = 500
      }
    }
  )

  if ((request.cf?.botManagement as any)?.verified_bot) {
    await body.allReady
  }

  responseHeaders.set('Content-Type', 'text/html')
  responseHeaders.set('X-Cached', `${cached}`)
  responseHeaders.set('X-KVed', `${kved}`)

  return new Response(body, {
    status: responseStatusCode,
    headers: responseHeaders
  })
}
