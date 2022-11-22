import { Link, NavLink } from '@remix-run/react'
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
          'flex-col gap-4 lg:flex-row lg:gap-0 lg:justify-between'
        )}
      >
        {navs.map((nav, index) => (
          <div key={index} className='flex flex-row justify-center'>
            <NavLink
              to={`/${nav.slug}`}
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
