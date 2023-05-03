import type { EntryContext } from '@remix-run/cloudflare'
import { RemixServer } from '@remix-run/react'
import { renderToReadableStream } from 'react-dom/server'
import { cached } from './utils/contentful'
import { kved } from './utils/kv'
import isbot from 'isbot'

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  const body = await renderToReadableStream(
    <RemixServer context={remixContext} url={request.url} />,
    {
      signal: request.signal,
      onError(error: unknown) {
        console.error(error)
        responseStatusCode = 500
      }
    }
  )

  if (isbot(request.headers.get('user-agent'))) {
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
