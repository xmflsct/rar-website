import type { MetaFunction } from 'react-router'
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
        type='button'
        className='cursor-pointer rounded-md border border-neutral-500 p-2 transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2'
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
