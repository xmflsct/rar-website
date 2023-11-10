import { faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from '@remix-run/react'
import { useContext } from 'react'
import Image from '~/components/image'
import { BagContext, CakeOrder } from '~/states/bag'
import { full } from '~/utils/currency'
import { getReadableDeliveryDate } from '~/utils/readableDeliveryDate'
import Button from './button'
import { PickupNotAvailable } from './cakeView'

type Props = {
  order: CakeOrder
}

const OrderList: React.FC<Props> = ({ order }) => {
  const { cakeRemove } = useContext(BagContext)

  return (
    <div key={order.sys.id} className='grid grid-cols-6 gap-4'>
      <Image alt={order.name} image={order.image} width={165} className='col-span-2' />
      <div className='col-span-4 relative flex flex-col'>
        <Link
          to={`/cake/${order.slug}`}
          className='text-md font-bold underline-offset-4 hover:underline pr-10'
          children={order.name}
        />
        <div className='flex-1 text-sm flex flex-col gap-2'>
          <PickupNotAvailable cake={order} />
          <div>
            {order.chosen.cakeCustomizations?.map(customization => {
              const matchedCustomization = order.cakeCustomizationsCollection?.items.findIndex(
                i => i.type === customization[0]
              )
              if (matchedCustomization === undefined) return
              return (
                <p key={customization[0]}>
                  <span className='font-bold'>
                    {order.cakeCustomizationsCollection?.items[matchedCustomization].type}
                    {': '}
                  </span>
                  {
                    order.cakeCustomizationsCollection?.items[matchedCustomization].options[
                      customization[1]
                    ]
                  }
                </p>
              )
            })}
          </div>
          {order.chosen.delivery?.type && order.chosen.delivery.date && (
            <p>{getReadableDeliveryDate(order)}</p>
          )}
        </div>
        <div>
          {full(order[`type${order.chosen.unit}Price`]!)} = {order.chosen.amount} {'\u00d7'}{' '}
          {order[`type${order.chosen.unit}Unit`]?.unit}
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
