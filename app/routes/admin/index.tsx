import { useTransition } from '@remix-run/react'
import { useEffect } from 'react'
import Layout from '~/layout'
import { Navigation } from '~/layout/navigation'

export const adminNavs: Navigation[] = [
  { name: 'Admin', slug: 'admin' },
  { name: 'Orders', slug: 'admin/orders' }
]

const PageAdmin: React.FC = () => {
  const transition = useTransition()

  useEffect(() => {
    console.log(transition)
  }, [transition])

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
