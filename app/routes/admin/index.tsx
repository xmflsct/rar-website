import { useTransition } from '@remix-run/react'
import Layout from '~/layout'
import { Navigation } from '~/layout/navigation'

export const adminNavs: Navigation[] = [
  { name: 'Admin', slug: '' },
  { name: 'Orders', slug: 'orders' }
]

const PageAdmin: React.FC = () => {
  const transition = useTransition()

  return (
    <Layout navs={adminNavs}>
      <div className='text-center text-lg'>
        {transition.state === 'loading' &&
        transition.type === 'normalLoad' &&
        transition.location.pathname === '/admin/orders'
          ? 'Please wait...'
          : null}
      </div>
    </Layout>
  )
}

export default PageAdmin
