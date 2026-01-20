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
  return [
    { rel: 'stylesheet', href: styles },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous',
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@400;700&display=swap',
    },
  ]
}

export const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <html lang='en' className='h-full scroll-smooth' suppressHydrationWarning>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width,initial-scale=1' />
        <Meta />
        <Links />
        <script
          defer
          src="https://views.xmflsct.com/script.js"
          data-website-id="a23e6701-b0ae-4a67-8830-59cb54fc4b09"
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
