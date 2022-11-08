import classNames from 'classnames'
import { PropsWithChildren } from 'react'

const Select: React.FC<
  PropsWithChildren &
    React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>
> = ({ children, className, ...props }) => {
  return (
    <select
      {...props}
      children={children}
      className={classNames(
        'flex-1 w-full truncate border-b border-neutral-500 pl-2 pr-4 py-2',
        className
      )}
    />
  )
}

export default Select
