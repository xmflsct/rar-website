import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from '@remix-run/react'
import { format, parseISO } from 'date-fns'
import { useContext } from 'react'
import Image from '~/components/image'
import { BagContext, CakeOrder } from '~/states/bag'
import { full } from '~/utils/currency'
import Button from './button'

type Props = {
  order: CakeOrder
}

const OrderList: React.FC<Props> = ({ order }) => {
  const { cakeRemove } = useContext(BagContext)

  const typeOption = (type: 'A' | 'B' | 'C') => {
    if (
      order.chosen[`type${type}Amount`] &&
      order[`type${type}Unit`] &&
      order[`type${type}Price`]
    ) {
      return (
        <p>
          {`${order.chosen[`type${type}Amount`]} \u00d7 ${
            order[`type${type}Unit`]!.unit
          } (${full(order[`type${type}Price`]!)})`}
        </p>
      )
    }
  }

  return (
    <div key={order.sys.id} className='grid grid-cols-5 gap-4'>
      <Image
        alt={order.name}
        image={order.image}
        width={201}
        className='col-span-2'
      />
      <div className='col-span-3 relative flex flex-col'>
        <Link
          to={`/cake/${order.slug}`}
          className='text-lg font-bold underline-offset-4 hover:underline'
          children={order.name}
        />
        <div className='flex-1 text-sm flex flex-col gap-2'>
          <div>
            {order.chosen.cakeCustomizations?.map(customization => {
              const matchedCustomization =
                order.cakeCustomizationsCollection?.items.findIndex(
                  i => i.type === customization[0]
                )
              if (matchedCustomization === undefined) return
              return (
                <p key={customization[0]}>{`${
                  order.cakeCustomizationsCollection?.items[
                    matchedCustomization
                  ].type
                }: ${
                  order.cakeCustomizationsCollection?.items[
                    matchedCustomization
                  ].options[customization[1]]
                }`}</p>
              )
            })}
          </div>
          <div>
            {typeOption('A')}
            {typeOption('B')}
            {typeOption('C')}
          </div>
          {order.chosen.delivery?.type && order.chosen.delivery.date && (
            <p>{`Special ${order.chosen.delivery.type}: ${parseISO(
              order.chosen.delivery.date
            ).toLocaleString('en-GB', {
              timeZone: 'Europe/Amsterdam',
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}`}</p>
          )}
        </div>
        <div>
          Total:{' '}
          {full(
            (order.chosen.typeAAmount ?? 0) * (order.typeAPrice ?? 0) +
              (order.chosen.typeBAmount ?? 0) * (order.typeBPrice ?? 0) +
              (order.chosen.typeCAmount ?? 0) * (order.typeCPrice ?? 0)
          )}
        </div>
        <Button
          onClick={e => {
            e.preventDefault()
            cakeRemove(order)
          }}
          className='absolute top-0 right-0 p-1 hover:opacity-50'
        >
          <FontAwesomeIcon icon={faTimes} fixedWidth />
        </Button>
      </div>
    </div>
  )
}

export default OrderList
