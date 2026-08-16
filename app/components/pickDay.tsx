import { Popover, Transition } from '@headlessui/react'
import { Fragment, useEffect, useState } from 'react'
import { DayPicker, DayPickerProps, Matcher, dateMatchModifiers } from 'react-day-picker'
import { DaysClosed } from '~/utils/contentful'
import {
  getValidDayAfterMatcher,
  getEarliestAvailableMatcher,
  getClosedWeekdayDates,
  EXCEPTIONAL_OPEN_DAYS
} from '~/utils/dateHelpers'

/**
 * Matcher for valid days (after minimum lead time)
 * Used to check if a date matches the "valid after" rule
 */
export const validDayAfter = (): Matcher => getValidDayAfterMatcher()

/**
 * Matcher to disable days before minimum lead time
 */
export const invalidDayBefore = (): Matcher => getEarliestAvailableMatcher()

/** Days when shop is open (Wed-Sun) */
const openDaysOfWeek: Matcher = { dayOfWeek: [0, 3, 4, 5, 6] }

/**
 * Get closed weekdays as individual dates, respecting exceptional open days
 */
const closedDaysOfWeek = (): Matcher[] => getClosedWeekdayDates()

/**
 * Check if a specific date is valid for ordering
 */
export const isDayValid = ({
  date,
  daysClosed
}: {
  date: Date
  daysClosed?: DaysClosed[]
}): boolean => {
  // Use validDayAfter to check minimum lead time
  if (!dateMatchModifiers(date, [validDayAfter()])) return false

  // Check exceptional open days first
  if (EXCEPTIONAL_OPEN_DAYS.length && dateMatchModifiers(date, EXCEPTIONAL_OPEN_DAYS)) return true

  // Check if shop is normally open
  if (!dateMatchModifiers(date, [openDaysOfWeek])) return false

  // Check closed date ranges
  if (daysClosed?.length) {
    for (const daysClosedRange of daysClosed) {
      if (
        dateMatchModifiers(date, {
          from: new Date(daysClosedRange.start),
          to: new Date(daysClosedRange.end)
        })
      ) {
        return false
      }
    }
  }

  return true
}

/**
 * Get all matchers for disabled days in the date picker
 */
export const closedDays = (daysCollection: DaysClosed[]): Matcher[] =>
  daysCollection
    ? [
        ...closedDaysOfWeek(),
        ...daysCollection.map(days => ({ from: new Date(days.start), to: new Date(days.end) }))
      ]
    : closedDaysOfWeek()

type Props = {
  name?: string
  date?: Date
  setDate: React.Dispatch<React.SetStateAction<Date | undefined>>
} & Omit<DayPickerProps, 'mode' | 'selected' | 'onSelect' | 'onDayClick'>

const PickDay: React.FC<Props> = ({ name, date, setDate, ...props }) => {
  const [isCompact, setIsCompact] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)')
    const update = () => setIsCompact(media.matches)

    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

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
            readOnly
            value={
              date
                ? date.toLocaleString('en-GB', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })
                : ''
            }
            aria-label='Choose a date'
            className='w-full h-full bg-inherit border-b border-neutral-500 pl-2 pr-4 text-left'
          />
          <Popover.Backdrop className='fixed inset-0 z-20 bg-black/30 lg:hidden' />
          <Transition
            as={Fragment}
            enter='transition ease-out duration-200'
            enterFrom='opacity-0 translate-y-4 lg:translate-y-1'
            enterTo='opacity-100 translate-y-0'
            leave='transition ease-in duration-150'
            leaveFrom='opacity-100 translate-y-0'
            leaveTo='opacity-0 translate-y-4 lg:translate-y-1'
          >
            <Popover.Panel
              modal={isCompact}
              className='fixed inset-x-0 bottom-0 z-30 max-h-[calc(100dvh-1rem)] overflow-y-auto rounded-t-2xl border border-neutral-200 bg-white p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-2xl lg:absolute lg:inset-x-auto lg:bottom-auto lg:left-1/2 lg:mt-3 lg:w-max lg:max-w-[calc(100vw-2rem)] lg:-translate-x-1/2 lg:overflow-visible lg:rounded-xl lg:p-4'
            >
              <div className='mb-1 flex items-center justify-between lg:hidden'>
                <div className='text-lg font-bold'>Choose a date</div>
                <button
                  type='button'
                  aria-label='Close calendar'
                  onClick={() => close()}
                  className='flex size-11 items-center justify-center rounded-full text-2xl hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2'
                >
                  &times;
                </button>
              </div>
              <DayPicker
                className='rar-date-picker'
                mode='single'
                selected={date}
                onSelect={handleDaySelect}
                onDayClick={() => close()}
                startMonth={new Date()}
                weekStartsOn={1}
                {...props}
                numberOfMonths={isCompact ? 1 : (props.numberOfMonths ?? 2)}
                autoFocus
              />
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  )
}

export default PickDay
