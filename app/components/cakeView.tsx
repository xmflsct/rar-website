import classNames from 'classnames'
import { format, parseISO } from 'date-fns'
import { Cake, DaysClosed } from '~/utils/contentful'
import { full } from '~/utils/currency'
import { correctPickup } from '~/utils/pickup'
import Button from './button'
import CakeOrder from './cakeOrder'
import Image from './image'
import RichText from './richText'

type Props = {
  cake: Cake
  daysClosedCollection: DaysClosed[]
}

export const PickupNotAvailable = ({
  cake
}: {
  cake: Pick<Cake, 'pickupNotAvailableStart' | 'pickupNotAvailableEnd'>
}) => {
  const dates = correctPickup(cake)
  if (dates.start && dates.end) {
    return (
      <p className='mt-2 text-sm'>
        Pickup not available between{' '}
        <span className='font-semibold'>{format(parseISO(dates.start), 'PP')}</span> -{' '}
        <span className='font-semibold'>{format(parseISO(dates.end), 'PP')}</span>
      </p>
    )
  }
  if (dates.start) {
    return (
      <p className='mt-2 text-sm'>
        Pickup not available after{' '}
        <span className='font-semibold'>{format(parseISO(dates.start), 'PP')}</span>
      </p>
    )
  }
  if (dates.end) {
    return (
      <p className='mt-2 text-sm'>
        Pickup not available before{' '}
        <span className='font-semibold'>{format(parseISO(dates.end), 'PP')}</span>
      </p>
    )
  }
}

const CakeView: React.FC<Props> = ({ cake, daysClosedCollection }) => {
  const typePrice = (type: 'A' | 'B' | 'C') => {
    const price = cake[`type${type}Price`]
    const unit = cake[`type${type}Unit`]
    const stock = cake[`type${type}Stock`]

    // Gift card special
    if (unit?.unit.includes('Card')) {
      return null
    }

    if (price && unit) {
      return (
        <li>
          {!cake[`type${type}Available`] ? '[In store] ' : null}
          <span
            className={classNames(typeof stock === 'number' && stock === 0 ? 'line-through' : null)}
          >
            {full(price)} / {unit.unit}
          </span>
        </li>
      )
    }
  }

  return (
    <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8'>
      <div className='grid grid-cols-1 gap-4'>
        {!cake.imagesCollection?.items.length ? (
          <Image alt={cake.name} image={cake.image} width={432} height={432} behaviour='fill' />
        ) : (
          cake.imagesCollection.items.map((image, index) => (
            <Image key={index} alt={cake.name} image={image} width={432} height={432} behaviour='fill' />
          ))
        )}
      </div>
      <div>
        {cake.available ? (
          <div className='text-3xl mb-4'>{cake.name}</div>
        ) : (
          <div className='text-3xl line-through'>{cake.name}</div>
        )}
        <RichText content={cake.description} daysClosedCollection={daysClosedCollection} />
        <ul className='flex-1 text-right'>
          {typePrice('A')}
          {typePrice('B')}
          {typePrice('C')}
        </ul>
        {cake.additionalInformation && (
          <div className='mt-8 md:mt-4'>
            <RichText
              className='prose-sm'
              content={cake.additionalInformation}
              daysClosedCollection={daysClosedCollection}
            />
          </div>
        )}
        {cake.available ? (
          <>
            <CakeOrder cake={cake} daysClosedCollection={daysClosedCollection} />
            <PickupNotAvailable cake={cake} />
          </>
        ) : (
          <Button disabled className='mt-4'>
            Not available
          </Button>
        )}
      </div>
    </div>
  )
}

export default CakeView
