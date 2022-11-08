import classNames from 'classnames'
import { Cake, DaysClosed } from '~/utils/contentful'
import { full } from '~/utils/currency'
import Button from './button'
import CakeOrder from './cakeOrder'
import Image from './image'
import RichText from './richText'

type Props = {
  cake: Cake
  daysClosedCollection: DaysClosed[]
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
      <Image alt={cake.name} image={cake.image} width={432} height={432} behaviour='fill' />
      <div className='flex flex-col'>
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
        {cake.available ? (
          <CakeOrder cake={cake} daysClosedCollection={daysClosedCollection} />
        ) : (
          <Button disabled>Sold Out</Button>
        )}
      </div>
    </div>
  )
}

export default CakeView
