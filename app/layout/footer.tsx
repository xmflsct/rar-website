import { Link } from '@remix-run/react'

const Footer: React.FC = () => {
  return (
    <footer className='mt-8 pb-4'>
      <div className='text-center text-sm lg:text-base'>
        <Link to='/'>Round &amp; Round Rotterdam</Link> &copy; 2016-
        {new Date().getFullYear()} &mdash; Made with ❤ by{' '}
        <a
          href='https://xmflsct.com'
          target='_blank'
          rel='noopener noreferrer'
          children='xmflsct'
        />
      </div>
    </footer>
  )
}

export default Footer
