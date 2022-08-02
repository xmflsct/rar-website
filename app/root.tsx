import { json, LoaderArgs, MetaFunction } from '@remix-run/cloudflare'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData
} from '@remix-run/react'
import { withSentry } from '@sentry/remix'
import BagProvider from './states/bag'
import styles from './styles/app.css'

export type Context =
  | {
      ENVIRONMENT?: 'PRODUCTION'
      CONTENTFUL_SPACE?: string
      CONTENTFUL_KEY?: string
      STRIPE_KEY_PRIVATE?: string
      STRIPE_KEY_PUBLIC?: string
      STRIPE_KEY_ADMIN?: string
      RAR_WEBSITE?: KVNamespace
    }
  | {
      ENVIRONMENT?: 'PREVIEW'
      CONTENTFUL_SPACE?: string
      CONTENTFUL_KEY?: string
      STRIPE_KEY_PRIVATE?: string
      STRIPE_KEY_PUBLIC?: string
      STRIPE_KEY_ADMIN?: string
      RAR_WEBSITE_PREVIEW?: KVNamespace
    }
export let context: Context = {}

export const loader = async (args: LoaderArgs) => {
  context = args.context

  return json({
    ENV: { STRIPE_KEY_PUBLIC: context.STRIPE_KEY_PUBLIC }
  })
}

export const links = () => {
  return [{ rel: 'stylesheet', href: styles }]
}

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  viewport: 'width=device-width,initial-scale=1'
})

const App: React.FC = () => {
  const data = useLoaderData<typeof loader>()

  return (
    <html lang='en' className='h-full scroll-smooth'>
      <head>
        <Meta />
        <Links />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data.ENV)}`
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(d) {var config = {kitId: 'ahl7mep',scriptTimeout: 3000,async: true},h=d.documentElement,t=setTimeout(function(){h.className=h.className.replace(/\bwf-loading\b/g,"")+" wf-inactive";},config.scriptTimeout),tk=d.createElement("script"),f=false,s=d.getElementsByTagName("script")[0],a;h.className+=" wf-loading";tk.src='https://use.typekit.net/'+config.kitId+'.js';tk.async=true;tk.onload=tk.onreadystatechange=function(){a=this.readyState;if(f||a&&a!="complete"&&a!="loaded")return;f=true;clearTimeout(t);try{Typekit.load(config)}catch(e){}};s.parentNode.insertBefore(tk,s)})(document);`
          }}
        />
      </head>
      <body className='h-full'>
        <BagProvider>
          <Outlet />
        </BagProvider>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}

export default withSentry(App)