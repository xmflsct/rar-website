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
        'disabled:opacity-50'
      )}
      {...rest}
    />
  )
}

export default Button
