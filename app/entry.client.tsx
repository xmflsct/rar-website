import { RemixBrowser, useLocation, useMatches } from '@remix-run/react'
import * as Sentry from '@sentry/remix'
import { useEffect } from 'react'
import { hydrate } from 'react-dom'

Sentry.init({
  dsn: 'https://79b2ce77fbfc4511af541c7a4cf125d3@o389581.ingest.sentry.io/6617177',
  tracesSampleRate: 0.1,
  integrations: [
    new Sentry.BrowserTracing({
      routingInstrumentation: Sentry.remixRouterInstrumentation(
        useEffect,
        useLocation,
        useMatches
      )
    })
  ]
})

hydrate(<RemixBrowser />, document)
