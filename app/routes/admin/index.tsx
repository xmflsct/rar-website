import Layout from '~/layout'
import { Navigation } from '~/layout/navigation'

export const adminNavs: Navigation[] = [
  { name: 'Admin', slug: 'admin' },
  { name: 'Orders', slug: 'admin/orders' }
]

const PageAdmin: React.FC = () => {
  return <Layout navs={adminNavs}>Hello world!</Layout>
}

export default PageAdmin
