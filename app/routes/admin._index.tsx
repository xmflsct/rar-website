import { useNavigation } from '@remix-run/react'
import Layout from '~/layout'
import { Navigation } from '~/layout/navigation'

export const adminNavs: Navigation[] = [
  { name: 'Admin', slug: 'admin' },
  { name: 'Orders', slug: 'admin/orders' }
]

const PageAdmin: React.FC = () => {
  const navigation = useNavigation()

  return (
    <Layout navs={adminNavs}>
      <div className='text-center text-lg'>
        {navigation.state === 'loading' && navigation.location.pathname === '/admin/orders'
          ? 'Please wait...'
          : null}
      </div>
    </Layout>
  )
}

export default PageAdmin
