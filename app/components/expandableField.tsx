import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Disclosure } from '@headlessui/react'
import classNames from 'classnames'
import { PropsWithChildren } from 'react'

type Props = {
  name: string
  optional?: boolean
  state?: 'positive' | 'negative'
}

const ExpandableField: React.FC<PropsWithChildren & Props> = ({
  name,
  optional = true,
  state,
  children
}) => {
  let stateBorder: string = ''
  if (state) {
    switch (state) {
      case 'positive':
        stateBorder = 'border-l-2 border-green-500'
        break
      case 'negative':
        stateBorder = 'border-l-2 border-red-500'
        break
    }
  } else {
    stateBorder = ''
  }

  const getTopCorners = (open: boolean): string => {
    if (state) {
      if (open) {
        return 'rounded-tr-md'
      } else {
        return 'rounded-r-md'
      }
    } else {
      if (open) {
        return 'rounded-t-md'
      } else {
        return 'rounded-md'
      }
    }
  }
  const getBottomCorners = (open: boolean): string => {
    if (state) {
      if (open) {
        return 'rounded-br-md'
      } else {
        return 'rounded-r-md'
      }
    } else {
      if (open) {
        return 'rounded-b-md'
      } else {
        return 'rounded-md'
      }
    }
  }

  return (
    <div>
      <Disclosure>
        {({ open }) => (
          <>
            <Disclosure.Button
              className={classNames(
                'peer',
                'flex w-full justify-between items-center',
                'bg-neutral-100 hover:bg-neutral-200',
                'px-4 py-2',
                getTopCorners(open),
                stateBorder
              )}
            >
              <span>
                {name}
                {optional ? (
                  <span className='ml-2 text-xs'>(Optional)</span>
                ) : null}
              </span>
              <FontAwesomeIcon
                icon={faChevronDown}
                fixedWidth
                className={open ? 'rotate-180 transform' : ''}
              />
            </Disclosure.Button>
            <Disclosure.Panel
              className={classNames(
                'bg-neutral-100 peer-hover:bg-neutral-200',
                'px-2',
                getBottomCorners(open),
                stateBorder
              )}
              children={children}
            />
          </>
        )}
      </Disclosure>
    </div>
  )
}

export default ExpandableField
