import { HydratedRouter } from 'react-router/dom'
import * as Sentry from '@sentry/react'
import { startTransition, StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'

Sentry.init({
  dsn: 'https://79b2ce77fbfc4511af541c7a4cf125d3@o389581.ingest.us.sentry.io/6617177',
  tracesSampleRate: 1,
  beforeSend(event) {
    const exception = event.exception?.values?.[0]
    const value = exception?.value ?? ''
    const frames = exception?.stacktrace?.frames ?? []
    const frameText = frames
      .flatMap(frame => [
        frame.filename,
        frame.abs_path,
        frame.function,
        ...(frame.context_line ? [frame.context_line] : []),
        ...((frame.pre_context ?? []) as string[]),
        ...((frame.post_context ?? []) as string[])
      ])
      .filter(Boolean)
      .join('\n')

    if (
      frameText.includes('__CF$cv$params') ||
      value.includes('a.contentWindow.document') ||
      value.includes("a.contentWindow is null") ||
      value.includes('Invalid call to runtime.sendMessage(). Tab not found.') ||
      value.includes('enableButtonsClickedMetaDataLogging: Java object is gone') ||
      (value.includes('Maximum call stack size exceeded') &&
        frames.length > 0 &&
        frames.every(frame => frame.filename === 'undefined'))
    ) {
      return null
    }

    return event
  }
})

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>
  )
})
