import classNames from 'classnames'
import {
  addDays,
  addMonths,
  formatISO,
  getMonth,
  isAfter,
  isBefore,
  isEqual,
  parseISO
} from 'date-fns'
import { useContext, useEffect, useRef, useState } from 'react'
import { DayPickerSingleProps } from 'react-day-picker'
import { BagContext } from '~/states/bag'
import { Cake, DaysClosed, DeliveryCustomization } from '~/utils/contentful'
import { getMinimumOrderDate } from '~/utils/dateHelpers'
import Button from './button'
import PickDay, { closedDays } from './pickDay'
import Select from './select'
import { trackAddToCart } from '~/utils/umami'

type Props = {
  cake: Cake
  daysClosedCollection: DaysClosed[]
}

const CakeOrder: React.FC<Props> = ({ cake, daysClosedCollection }) => {
  const { cakeAdd } = useContext(BagContext)

  const [unit, setUnit] = useState<'A' | 'B' | 'C' | undefined>(undefined)
  const [amount, setAmount] = useState<string>('')

  const [cakeCustomizations, setCakeCustomizations] = useState<[string, number, string?][]>([])

  const needDeliveryOptions = useRef(cake.shippingAvailable)

  const [delivery, setDelivery] = useState<'pickup' | 'shipping' | ''>('')
  const [deliveryDate, setDeliveryDate] = useState<Date>()

  // Temp solution
  const [deliveryMinimum, setDeliveryMinimum] = useState<number>()
  useEffect(() => {
    if (needDeliveryOptions.current) {
      let tempMin
      switch (delivery) {
        case 'pickup':
          tempMin = cake.deliveryCustomizations?.pickup?.minimum
          break
        case 'shipping':
          tempMin = cake.deliveryCustomizations?.shipping?.minimum

          break
      }
      setDeliveryMinimum(tempMin)
      if (tempMin && parseInt(amount) < tempMin) {
        setAmount('')
      }
    }
  }, [delivery])

  const renderDeliveryOptions = () => {
    if (needDeliveryOptions.current) {
      return (
        <Select
          name='delivery'
          value={delivery}
          required
          onChange={e => {
            if (e.target.value === 'pickup' || e.target.value === 'shipping') {
              setDelivery(e.target.value)
              setDeliveryDate(undefined)
            }
          }}
        >
          <option value='' children='Pickup / Delivery ...' disabled />
          <option value='pickup' children='Pickup in store' />
          <option value='shipping' children='Shipping (PostNL)' />
        </Select>
      )
    }
  }
  const renderDeliveryDates = () => {
    if (delivery === '') return
    const availability = cake.deliveryCustomizations?.[delivery]?.availability

    if (availability) {
      const renderAvailability = (
        availability: DeliveryCustomization
      ): Omit<
        DayPickerSingleProps,
        'date' | 'setDate' | 'mode' | 'select' | 'onSelect' | 'onDayClick'
      > => {
        // Get minimum order date based on current time in Amsterdam
        const maxLimit = getMinimumOrderDate()

        let startingDate: Date
        let endingDate: Date
        let numberOfMonths = 2
        if (Array.isArray(availability)) {
          const getStillAvailable = availability
            .sort((a, b) => (a.date < b.date ? -1 : 1))
            .filter(({ before }) => (before ? isBefore(new Date(), parseISO(before)) : true))[0]
            ?.date as string | undefined
          endingDate = parseISO(availability.sort((a, b) => (a.date > b.date ? -1 : 1))[0].date)
          if (!getStillAvailable) {
            return {
              defaultMonth: endingDate,
              fromMonth: endingDate,
              toMonth: endingDate,
              disabled: { after: new Date(2000, 1, 1) }
            }
          }
          startingDate = parseISO(getStillAvailable)
        } else {
          startingDate = availability.after ? parseISO(availability.after) : addDays(new Date(), 2)
          endingDate = availability.before
            ? parseISO(availability.before)
            : addMonths(new Date(), 1)
        }

        const diffMonths = getMonth(endingDate) - getMonth(startingDate)
        numberOfMonths = Math.min(2, diffMonths + 1)

        return {
          defaultMonth: startingDate,
          fromMonth: startingDate,
          toMonth: endingDate,
          numberOfMonths,
          disabled: [
            ...(!Array.isArray(availability) || !availability.map(a => a.date).length
              ? closedDays(daysClosedCollection)
              : []),
            ...(Array.isArray(availability)
              ? [
                  (date: Date) =>
                    availability.filter(
                      a =>
                        (a.before ? isBefore(new Date(), parseISO(a.before)) : true) &&
                        isEqual(parseISO(a.date), date)
                    ).length <= 0
                ]
              : [
                  { before: isAfter(maxLimit, startingDate) ? maxLimit : startingDate },
                  { after: endingDate }
                ])
          ]
        }
      }

      return (
        <PickDay
          date={deliveryDate}
          setDate={setDeliveryDate}
          required
          {...renderAvailability(availability)}
        />
      )
    }
  }

  const renderCakeCustomizations = () => {
    return (
      <div className='flex flex-row gap-4 mb-2'>
        {cake.cakeCustomizationsCollection?.items.map((customization, index) => {
          if (!customization) return null

          const selectedIndex = cakeCustomizations.findIndex(c => c[0] === customization.type)
          const maxLength = customization.customMaxLength || 30
          return (
            <div key={index} className='flex-1'>
              <div className='font-bold'>{customization.type}</div>
              <div className='flex flex-row gap-2'>
                <Select
                  key={index}
                  required
                  name={customization.type}
                  value={selectedIndex > -1 ? cakeCustomizations[selectedIndex][1] : ''}
                  onChange={e => {
                    if (selectedIndex > -1) {
                      setCakeCustomizations(
                        cakeCustomizations.map(c =>
                          c[0] === customization.type ? [c[0], parseInt(e.target.value)] : c
                        )
                      )
                    } else {
                      setCakeCustomizations([
                        ...cakeCustomizations,
                        [customization.type, parseInt(e.target.value)]
                      ])
                    }
                  }}
                  className={
                    cakeCustomizations.filter(c => c[0] === customization.type).length
                      ? undefined
                      : 'text-gray-400'
                  }
                >
                  <option value='' children={`${customization.type} ...`} disabled />
                  {customization.options.map((option, index) => (
                    <option key={index} value={index} children={option} />
                  ))}
                  {!!customization.customAllow ? <option value={-1} children='Custom' /> : null}
                </Select>
                {selectedIndex > -1 && cakeCustomizations[selectedIndex][1] === -1 ? (
                  <div className='grow flex flex-row'>
                    <input
                      name='custom'
                      autoFocus
                      required
                      type='text'
                      className='grow border-b border-neutral-500 bg-transparent'
                      value={selectedIndex > -1 ? cakeCustomizations[selectedIndex][2] : ''}
                      onChange={({ target: { value } }) => {
                        if (
                          selectedIndex > -1 &&
                          new TextEncoder().encode(value).length <= maxLength
                        ) {
                          setCakeCustomizations(
                            cakeCustomizations.map(c =>
                              c[0] === customization.type ? [c[0], c[1], value] : c
                            )
                          )
                        }
                      }}
                    />
                    <input
                      className='border-b border-neutral-500 bg-transparent text-sm text-neutral-500 text-center'
                      readOnly
                      value={`${
                        new TextEncoder().encode(cakeCustomizations[selectedIndex][2]).length || 0
                      } / ${maxLength}`}
                      size={7}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const availableTypes = (['C', 'B', 'A'] as ['C', 'B', 'A']).filter(type => {
    const available = cake[`type${type}Available`]
    if (!available) return false

    const price = cake[`type${type}Price`]
    const unit = cake[`type${type}Unit`]?.unit
    return price && unit
  })
  useEffect(() => {
    setUnit(availableTypes[0])
  }, [])
  useEffect(() => {
    const minimum = unit ? cake[`type${unit}Minimum`] : undefined
    const stock = unit ? cake[`type${unit}Stock`] : undefined
    const stockDefined = stock !== (undefined || null)

    if (stockDefined && (stock === 0 || (stock && stock < parseInt(amount)))) {
      setAmount('')
    }
    if (minimum && minimum > parseInt(amount)) {
      setAmount('')
    }
  }, [unit, amount])
  const renderTypeOptions = () => {
    const minimum = unit ? cake[`type${unit}Minimum`] : undefined
    const stock = unit ? cake[`type${unit}Stock`] : undefined
    const stockDefined = stock !== (undefined || null)

    if (stockDefined && stock === 0) {
      return (
        <Select name={unit} value='' required={false} className='text-gray-400' disabled>
          <option value='' children='Sold out' disabled />
        </Select>
      )
    }

    return (
      <div className='flex flex-col mb-2'>
        <div className='font-bold'>Order</div>
        <div className='flex flex-col lg:flex-row gap-4'>
          <Select
            name='amount'
            value={amount}
            required={true}
            onChange={e => e.target.value && setAmount(e.target.value)}
            className={amount.length ? undefined : 'text-gray-400'}
          >
            <option value='' children='Amount' disabled />
            {Array(stockDefined ? (stock || 0) + 1 : 16)
              .fill(undefined)
              .map((_, index) =>
                (deliveryMinimum || 1) <= index && (minimum || 1) <= index ? (
                  <option key={index} value={index} children={index} />
                ) : null
              )}
          </Select>
          <Select
            name='unit'
            value={unit}
            required={true}
            disabled={availableTypes.length <= 1}
            onChange={e => e.target.value && setUnit(e.target.value as 'A' | 'B' | 'C')}
            className={availableTypes.length <= 1 ? 'appearance-none' : undefined}
          >
            <option value='' children='Type' disabled />
            {availableTypes.map(type => (
              <option key={type} value={type} children={cake[`type${type}Unit`]?.unit} />
            ))}
          </Select>
        </div>
      </div>
    )
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault()

    if (unit && amount.length) {
      const price = cake[`type${unit}Price`] ?? 0
      const quantity = parseInt(amount)
      
      cakeAdd({
        ...cake,
        chosen: {
          ...(cakeCustomizations.length && { cakeCustomizations }),
          unit,
          amount: quantity,
          ...(needDeliveryOptions.current &&
            delivery !== '' && {
              delivery: {
                type: delivery,
                date: deliveryDate ? formatISO(deliveryDate, { representation: 'date' }) : undefined
              }
            })
        }
      })

      // Track add to cart event for Umami analytics
      trackAddToCart({
        name: cake.name,
        price,
        quantity
      })
    }
  }

  return (
    <form className='flex flex-col gap-4 mt-4' onSubmit={handleSubmit}>
      {needDeliveryOptions.current ? (
        <div>
          <div className='font-bold mb-2'>Delivery option</div>
          <div
            className={classNames(
              'grid gap-4',
              cake.deliveryCustomizations?.pickup || cake.deliveryCustomizations?.shipping
                ? 'grid-cols-2'
                : 'grid-cols-1'
            )}
          >
            {renderDeliveryOptions()}
            {renderDeliveryDates()}
          </div>
        </div>
      ) : null}
      {renderTypeOptions()}
      {cake.cakeCustomizationsCollection?.items.length ? renderCakeCustomizations() : null}
      <Button type='submit'>Add to bag</Button>
    </form>
  )
}

export default CakeOrder
