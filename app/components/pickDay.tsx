import { Popover, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { DayPicker, DayPickerProps, Matcher, isDateRange, isMatch } from 'react-day-picker'
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
  if (!isMatch(date, [validDayAfter()])) return false

  // Check exceptional open days first
  if (EXCEPTIONAL_OPEN_DAYS.length && isMatch(date, EXCEPTIONAL_OPEN_DAYS)) return true

  // Check if shop is normally open
  if (!isMatch(date, [openDaysOfWeek])) return false

  // Check closed date ranges
  if (daysClosed?.length) {
    for (const daysClosedRange of daysClosed) {
      if (
        isDateRange({
          after: new Date(daysClosedRange.start),
          before: new Date(daysClosedRange.end)
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
                numberOfMonths={2}
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
