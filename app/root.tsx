import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteError,
} from 'react-router'
import LayoutUI from '~/layout'
import BagProvider from './states/bag'
import styles from './styles/app.css?url'

export const links = () => {
  return [{ rel: 'stylesheet', href: styles }]
}

export const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <html lang='en' className='h-full scroll-smooth'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width,initial-scale=1' />
        <Meta />
        <Links />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(d) {var config = {kitId: 'ahl7mep',scriptTimeout: 3000,async: true},h=d.documentElement,t=setTimeout(function(){h.className=h.className.replace(/\\bwf-loading\\b/g,"")+\" wf-inactive\";},config.scriptTimeout),tk=d.createElement("script"),f=false,s=d.getElementsByTagName("script")[0],a;h.className+=" wf-loading";tk.src='https://use.typekit.net/'+config.kitId+'.js';tk.async=true;tk.onload=tk.onreadystatechange=function(){a=this.readyState;if(f||a&&a!="complete"&&a!="loaded")return;f=true;clearTimeout(t);try{Typekit.load(config)}catch(e){}};s.parentNode.insertBefore(tk,s)})(document);`
          }}
        />
      </head>
      <body className='h-full'>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export const ErrorBoundary = () => {
  const error = useRouteError()

  return (
    <LayoutUI>
      {isRouteErrorResponse(error) ? (
        <>
          <h1 className='text-3xl text-center mb-4'>{error.status + ' ' + error.statusText}</h1>
          <p className='text-xl text-center'>Please contact us directly</p>
        </>
      ) : undefined}
    </LayoutUI>
  )
}

const App: React.FC = () => {
  return (
    <BagProvider>
      <Outlet />
    </BagProvider>
  )
}

export default App
