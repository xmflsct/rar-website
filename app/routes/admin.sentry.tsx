import { MetaFunction } from '@remix-run/cloudflare'
import Layout from '~/layout'
import { adminNavs } from './admin._index'

export const meta: MetaFunction = () => [
  {
    title: 'Sentry | Round&Round Rotterdam'
  }
]

const PageAdminSentry: React.FC = () => {
  return (
    <Layout navs={adminNavs}>
      <button
        onClick={() => {
          throw new Error(new Date().toISOString())
        }}
      >
        Test Sentry
      </button>
    </Layout>
  )
}

export default PageAdminSentry
