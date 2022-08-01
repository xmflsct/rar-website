import { Link, NavLink, useMatches } from '@remix-run/react'
import classNames from 'classnames'
import logo from '~/images/logo.png'

export type Navigation = {
  name: string
  slug: string
}

type Props = {
  navs: Navigation[]
  toggleNav: boolean
}

const Nav: React.FC<Props> = ({ navs, toggleNav }) => {
  const matches = useMatches()
  const isAdmin = matches[matches.length - 1].pathname.startsWith('/admin')

  return (
    <header className='mt-4 mb-8'>
      <div className='flex flex-row justify-center mb-4'>
        <Link to='/'>
          <img alt='Logo' src={logo} width={138} height={138} />
        </Link>
      </div>
      <nav
        className={classNames(
          `${toggleNav ? 'flex' : 'hidden'} lg:flex`,
          'flex-col gap-4 lg:flex-row lg:gap-0'
        )}
      >
        {navs.map((nav, index) => (
          <div key={index} className='flex-1 flex flex-row justify-center'>
            <NavLink
              to={!isAdmin && index === 0 ? '/' : `/${nav.slug}`}
              children={nav.name}
              className='border-b-2 border-spacing-2 border-neutral-700 border-dotted hover:border-solid'
            />
          </div>
        ))}
      </nav>
    </header>
  )
}

export default Nav
