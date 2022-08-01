import {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  PropsWithChildren
} from 'react'

const Button: React.FC<
  PropsWithChildren &
    DetailedHTMLProps<
      ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    >
> = props => {
  return (
    <button
      className='border border-neutral-500 rounded-md px-4 py-2'
      {...props}
    />
  )
}

export default Button
