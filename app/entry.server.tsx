import type { EntryContext } from 'react-router'
import { ServerRouter } from 'react-router'
import { renderToReadableStream } from 'react-dom/server'
import { cached } from './utils/contentful'
import { kved } from './utils/kv'

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  entryContext: EntryContext
) {
  const body = await renderToReadableStream(
    <ServerRouter context={entryContext} url={request.url} />,
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
