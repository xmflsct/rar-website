import { HydratedRouter } from 'react-router/dom'
import * as Sentry from '@sentry/react'
import { startTransition, StrictMode } from 'react'
import { hydrateRoot } from 'react-dom/client'

Sentry.init({
  dsn: 'https://79b2ce77fbfc4511af541c7a4cf125d3@o389581.ingest.us.sentry.io/6617177',
  tracesSampleRate: 1
})

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>
  )
})
