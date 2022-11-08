import { Popover, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { DayPicker, DayPickerSingleProps, Matcher } from 'react-day-picker'
import { DaysClosed } from '~/utils/contentful'

export const closedDays = (daysCollection: DaysClosed[]): Matcher[] =>
  daysCollection
    ? [
        { dayOfWeek: [1, 2] },
        ...daysCollection.map(days => ({ from: new Date(days.start), to: new Date(days.end) }))
      ]
    : [{ dayOfWeek: [1, 2] }]

type Props = {
  name?: string
  date?: Date
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>
} & Omit<DayPickerSingleProps, 'mode' | 'select' | 'onSelect' | 'onDayClick'>

const PickDay: React.FC<Props> = ({ name, date, setDate, ...props }) => {
  const handleDaySelect = (date: Date | undefined) => {
    if (date) {
      setDate(date)
    }
  }

  return (
    <Popover className='lg:relative'>
      {({ close }) => (
        <>
          <Popover.Button
            as='input'
            type='text'
            name={name}
            required={props.required}
            placeholder='Select date ...'
            value={
              date
                ? date.toLocaleString('en-GB', {
                    timeZone: 'Europe/Amsterdam',
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })
                : ''
            }
            className='w-full h-full bg-inherit border-b border-neutral-500 pl-2 pr-4 text-left'
          />
          <Transition
            as={Fragment}
            enter='transition ease-out duration-200'
            enterFrom='opacity-0 translate-y-1'
            enterTo='opacity-100 translate-y-0'
            leave='transition ease-in duration-150'
            leaveFrom='opacity-100 translate-y-0'
            leaveTo='opacity-0 translate-y-1'
          >
            <Popover.Panel className='absolute left-1/2 z-10 mt-3 -translate-x-1/2 transform px-4 sm:px-0 lg:max-w-3xl bg-white drop-shadow-md'>
              <DayPicker
                mode='single'
                selected={date}
                onSelect={handleDaySelect}
                onDayClick={() => close()}
                fromMonth={new Date()}
                weekStartsOn={1}
                {...props}
              />
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}

export default PickDay
