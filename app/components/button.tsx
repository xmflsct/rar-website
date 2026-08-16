import classNames from 'classnames'
import { ButtonHTMLAttributes, DetailedHTMLProps, PropsWithChildren } from 'react'

const Button: React.FC<
  PropsWithChildren & DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
> = ({ className, ...rest }) => {
  return (
    <button
      type='button'
      className={classNames(
        className,
        'flex flex-row justify-center items-center',
        'border border-neutral-500 rounded-md',
        'p-2',
        'cursor-pointer transition-colors',
        'enabled:hover:bg-neutral-100',
        'focus-visible:outline-2 focus-visible:outline-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50'
      )}
      {...rest}
    />
  )
}

export default Button
