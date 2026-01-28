import { faCartShopping } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link, useMatches } from 'react-router'
import { sumBy } from 'lodash'
import { useContext } from 'react'
import { BagContext } from '~/states/bag'

type Props = {
  toggleNav: boolean
  setToggleNav: React.Dispatch<React.SetStateAction<boolean>>
}

const Header: React.FC<Props> = ({ toggleNav, setToggleNav }) => {
  const { cakeOrders } = useContext(BagContext)

  const matches = useMatches()
  const pathname = matches[matches.length - 1]?.pathname ?? ''
  const isAdmin = pathname.startsWith('/admin')
  const hide = pathname.startsWith('/shopping-bag') || pathname.startsWith('/thank-you/id/')

  const bagTotal = sumBy(cakeOrders, order => order.chosen.amount)

  return (
    <div className='fixed w-full'>
      <button
        aria-label='Mobile hamburger menu'
        className='block lg:hidden p-4 bg-white/90 lg:bg-transparent'
        onClick={() => {
          toggleNav === false && typeof window !== undefined && window.scrollTo(0, 0)
          setToggleNav(!toggleNav)
        }}
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          className='w-6 h-6'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            d='M4 6h16M4 12h16M4 18h16'
          />
        </svg>
      </button>
      {!isAdmin && !hide ? (
        <Link
          to='/shopping-bag'
          className='absolute top-0 right-0 p-4 bg-white/90 lg:bg-transparent'
        >
          <FontAwesomeIcon icon={faCartShopping} /> ({bagTotal})
        </Link>
      ) : null}
    </div>
  )
}

export default Header
