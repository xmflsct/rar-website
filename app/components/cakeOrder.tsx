import classNames from 'classnames'
import { addDays, addMonths, formatISO, isEqual, parseISO } from 'date-fns'
import { useContext, useEffect, useRef, useState } from 'react'
import { DayPickerSingleProps } from 'react-day-picker'
import { BagContext } from '~/states/bag'
import { Cake, DeliveryCustomization } from '~/utils/contentful'
import Button from './button'
import PickDay, { SHOP_CLOSED_DAYS } from './pickDay'
import Select from './select'

type Props = {
  cake: Cake
}

const CakeOrder: React.FC<Props> = ({ cake }) => {
  const { cakeAdd, cakeCheck } = useContext(BagContext)
  const [amounts, setAmounts] = useState<{
    typeAAmount: string
    typeBAmount: string
    typeCAmount: string
  }>({ typeAAmount: '', typeBAmount: '', typeCAmount: '' })

  const [cakeCustomizations, setCakeCustomizations] = useState<
    [string, number][]
  >([])

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
      if (tempMin) {
        setAmounts({
          typeAAmount:
            parseInt(amounts.typeAAmount) < tempMin ? '' : amounts.typeAAmount,
          typeBAmount:
            parseInt(amounts.typeBAmount) < tempMin ? '' : amounts.typeBAmount,
          typeCAmount:
            parseInt(amounts.typeCAmount) < tempMin ? '' : amounts.typeCAmount
        })
      }
    }
  }, [delivery])

  const added = cakeCheck({
    ...cake,
    chosen: { delivery: delivery === '' ? undefined : { type: delivery } }
  })
  useEffect(() => {
    if (added) {
      if (added.chosen.cakeCustomizations?.length) {
        setCakeCustomizations(added.chosen.cakeCustomizations)
      }
      setAmounts({
        ...amounts,
        ...(added.chosen.typeAAmount && {
          typeAAmount: added.chosen.typeAAmount.toString()
        }),
        ...(added.chosen.typeBAmount && {
          typeBAmount: added.chosen.typeBAmount.toString()
        }),
        ...(added.chosen.typeCAmount && {
          typeCAmount: added.chosen.typeCAmount.toString()
        })
      })
      new Array('pickup', 'shipping').forEach(type => {
        if (added.chosen.delivery?.type === type) {
          setDelivery(type)
          if (added.chosen.delivery.date) {
            setDeliveryDate(parseISO(added.chosen.delivery.date))
          }
        }
      })
    }
  }, [])

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
          <option value='shipping' children='Shipping in NL (PostNL)' />
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
        let startingDate: Date
        let endingDate: Date
        if (Array.isArray(availability)) {
          startingDate = parseISO(
            availability.sort((a, b) => (a.date < b.date ? -1 : 1))[0].date
          )
          endingDate = parseISO(
            availability.sort((a, b) => (a.date > b.date ? -1 : 1))[0].date
          )
        } else {
          startingDate = availability.after
            ? parseISO(availability.after)
            : addDays(new Date(), 2)
          endingDate = availability.before
            ? parseISO(availability.before)
            : addMonths(new Date(), 1)
        }

        return {
          defaultMonth: startingDate,
          fromMonth: startingDate,
          toMonth: endingDate,
          disabled: [
            SHOP_CLOSED_DAYS,
            ...(Array.isArray(availability)
              ? [
                  (date: Date) =>
                    availability.filter(a => isEqual(parseISO(a.date), date))
                      .length <= 0
                ]
              : [{ before: startingDate }, { after: endingDate }])
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
    return cake.cakeCustomizationsCollection?.items.map(
      (customization, index) => {
        const customizationSelected = cakeCustomizations.filter(
          c => c[0] === customization.type
        )
        return (
          <Select
            key={index}
            required
            name={customization.type}
            value={
              customizationSelected.length === 1
                ? customizationSelected[0][1]
                : ''
            }
            onChange={e => {
              if (customizationSelected.length === 1) {
                setCakeCustomizations(
                  cakeCustomizations.map(c =>
                    c[0] === customization.type
                      ? [c[0], parseInt(e.target.value)]
                      : c
                  )
                )
              } else {
                setCakeCustomizations([
                  ...cakeCustomizations,
                  [customization.type, parseInt(e.target.value)]
                ])
              }
            }}
          >
            <option value='' children={`${customization.type} ...`} disabled />
            {customization.options.map((option, index) => (
              <option key={index} value={index} children={option} />
            ))}
          </Select>
        )
      }
    )
  }

  const renderTypeOptions = (type: 'A' | 'B' | 'C') => {
    const available = cake[`type${type}Available`]

    if (!available) return

    const amount = amounts[`type${type}Amount`]
    const price = cake[`type${type}Price`]
    const unit = cake[`type${type}Unit`]?.unit
    const minimum = cake[`type${type}Minimum`]

    if (price && unit) {
      return (
        <Select
          name={unit}
          value={amount}
          required={
            amounts.typeAAmount.length === 0 &&
            amounts.typeBAmount.length === 0 &&
            amounts.typeCAmount.length === 0
          }
          onChange={e =>
            e.target.value &&
            setAmounts({
              ...amounts,
              [`type${type}Amount`]: e.target.value
            })
          }
        >
          <option value='' children={`${unit} ...`} disabled />
          {Array(16)
            .fill(undefined)
            .map((_, index) =>
              (deliveryMinimum || 1) <= index && (minimum || 1) <= index ? (
                <option
                  key={index}
                  value={index}
                  children={index === 0 ? unit : `${index} \u00d7 ${unit}`}
                />
              ) : null
            )}
        </Select>
      )
    }
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault()

    if (
      amounts.typeAAmount.length ||
      amounts.typeBAmount.length ||
      amounts.typeCAmount.length
    ) {
      cakeAdd({
        ...cake,
        chosen: {
          ...(cakeCustomizations.length && { cakeCustomizations }),
          ...(amounts.typeAAmount.length && {
            typeAAmount: parseInt(amounts.typeAAmount)
          }),
          ...(amounts.typeBAmount.length && {
            typeBAmount: parseInt(amounts.typeBAmount)
          }),
          ...(amounts.typeCAmount.length && {
            typeCAmount: parseInt(amounts.typeCAmount)
          }),
          ...(needDeliveryOptions.current &&
            delivery !== '' && {
              delivery: {
                type: delivery,
                date: deliveryDate ? formatISO(deliveryDate) : undefined
              }
            })
        }
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
              cake.deliveryCustomizations?.pickup ||
                cake.deliveryCustomizations?.shipping
                ? 'grid-cols-2'
                : 'grid-cols-1'
            )}
          >
            {renderDeliveryOptions()}
            {renderDeliveryDates()}
          </div>
        </div>
      ) : null}
      {cake.cakeCustomizationsCollection?.items.length ? (
        <div className='flex flex-col gap-2'>
          <div className='font-bold'>Customizations</div>
          <div className='flex flex-row gap-4'>
            {renderCakeCustomizations()}
          </div>
        </div>
      ) : null}
      <div className='flex flex-col gap-2'>
        <div className='font-bold'>Quantity</div>
        <div className='flex flex-col lg:flex-row gap-4'>
          {renderTypeOptions('A')}
          {renderTypeOptions('B')}
          {renderTypeOptions('C')}
        </div>
      </div>
      <Button type='submit'>{added ? 'Update bag' : 'Add to bag'}</Button>
    </form>
  )
}

export default CakeOrder
