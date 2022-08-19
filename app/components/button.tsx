import classNames from 'classnames'
import { ButtonHTMLAttributes, DetailedHTMLProps, PropsWithChildren } from 'react'

const Button: React.FC<
  PropsWithChildren & DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
> = ({ className, ...rest }) => {
  return (
    <button
      className={classNames(
        className,
        'flex flex-row items-center',
        'border border-neutral-500 rounded-md',
        'px-4 py-2',
        'disabled:opacity-50'
      )}
      {...rest}
    />
  )
}

export default Button
