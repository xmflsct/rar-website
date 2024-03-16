import { useMatches } from '@remix-run/react'
import classNames from 'classnames'
import { PropsWithChildren, useState } from 'react'
import Footer from './footer'
import Header from './header'
import Nav, { Navigation } from './navigation'

type Props = {
  navs?: Navigation[]
}
const Layout: React.FC<PropsWithChildren & Props> = ({ children, navs }) => {
  const matches = useMatches()
  const isAdmin = matches[matches.length - 1].pathname.startsWith('/admin')

  const [toggleNav, setToggleNav] = useState(false)

  return (
    <>
      <Header toggleNav={toggleNav} setToggleNav={setToggleNav} />
      <div
        className={classNames('h-full flex flex-col', !isAdmin ? 'max-w-4xl mx-4 lg:mx-auto' : '')}
      >
        <Nav navs={navs} toggleNav={toggleNav} />
        <main className='flex-1' children={children} />
        <Footer />
      </div>
    </>
  )
}

export default Layout
