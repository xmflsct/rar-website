import { addDays, format, getDay, isSameDay, parseISO } from 'date-fns'
import type { Matcher } from 'react-day-picker'
import type { DaysClosed } from './contentful'

/** Hour of day (24h format) after which the next available date shifts by one day */
export const SHOP_CUTOFF_HOUR = 16

/** Days of the week the shop is closed (0 = Sunday, 1 = Monday, ..., 6 = Saturday) */
export const SHOP_CLOSED_DAYS = [1, 2] // Monday, Tuesday

/** Minimum lead time in days when ordering before cutoff hour */
export const MIN_LEAD_TIME_BEFORE_CUTOFF = 2

/** Minimum lead time in days when ordering after cutoff hour */
export const MIN_LEAD_TIME_AFTER_CUTOFF = 3

/** Exceptional days when the shop is open despite being on a normally closed day */
export const EXCEPTIONAL_OPEN_DAYS: Date[] = [new Date(2025, 11, 23)]

/** Amsterdam timezone identifier */
export const AMSTERDAM_TIMEZONE = 'Europe/Amsterdam'

// ============================================================================
// TIMEZONE HELPERS
// ============================================================================

/**
 * Get the current hour in Amsterdam timezone
 * @param date Optional date to check (defaults to now)
 * @returns Hour in 24-hour format (0-23)
 */
export const getAmsterdamHour = (date: Date = new Date()): number => {
  return parseInt(
    date.toLocaleString('nl-NL', {
      timeZone: AMSTERDAM_TIMEZONE,
      hour: '2-digit',
      hour12: false
    })
  )
}

/**
 * Check if current time is past the shop cutoff hour
 * @param date Optional date to check (defaults to now)
 * @returns true if past cutoff hour
 */
export const isPastCutoff = (date: Date = new Date()): boolean => {
  return getAmsterdamHour(date) > SHOP_CUTOFF_HOUR
}

// ============================================================================
// DATE VALIDATION
// ============================================================================

/**
 * Get the minimum order date based on current time
 * - Before cutoff: today + MIN_LEAD_TIME_BEFORE_CUTOFF days
 * - After cutoff: today + MIN_LEAD_TIME_AFTER_CUTOFF days
 * @returns The earliest date a customer can select
 */
export const getMinimumOrderDate = (): Date => {
  const leadTime = isPastCutoff() ? MIN_LEAD_TIME_AFTER_CUTOFF : MIN_LEAD_TIME_BEFORE_CUTOFF
  return addDays(new Date(), leadTime)
}

/**
 * Check if a specific date is a day when the shop is regularly open
 * @param date Date to check
 * @param exceptionalDays Optional array of exceptional open days
 * @returns true if the shop is open on this day
 */
export const isShopOpen = (
  date: Date,
  exceptionalDays: Date[] = EXCEPTIONAL_OPEN_DAYS
): boolean => {
  // Check if this is an exceptional open day
  if (exceptionalDays.some(d => isSameDay(d, date))) {
    return true
  }

  // Check if this is a normally closed day
  const dayOfWeek = getDay(date)
  return !SHOP_CLOSED_DAYS.includes(dayOfWeek)
}

/**
 * Check if a date falls within any closed date range
 * @param date Date to check
 * @param closedRanges Array of closed date ranges
 * @returns true if the date is within a closed range
 */
export const isDateInClosedRange = (
  date: Date,
  closedRanges: DaysClosed[]
): boolean => {
  for (const range of closedRanges) {
    const start = new Date(range.start)
    const end = new Date(range.end)
    if (date >= start && date <= end) {
      return true
    }
  }
  return false
}

/**
 * Check if a date is valid for ordering
 * Validates:
 * 1. Date is at or after minimum order date
 * 2. Shop is open on that day
 * 3. Date is not within any closed range
 *
 * @param date Date to validate
 * @param options.daysClosed Optional closed date ranges
 * @returns true if the date is valid for ordering
 */
export const isValidOrderDate = (
  date: Date,
  options?: { daysClosed?: DaysClosed[] }
): boolean => {
  const minimumDate = getMinimumOrderDate()

  // Must be at or after minimum date
  if (date < minimumDate) {
    return false
  }

  // Check if this is an exceptional open day first
  if (EXCEPTIONAL_OPEN_DAYS.some(d => isSameDay(d, date))) {
    // Still check closed ranges for exceptional days
    if (options?.daysClosed && isDateInClosedRange(date, options.daysClosed)) {
      return false
    }
    return true
  }

  // Shop must be open
  if (!isShopOpen(date)) {
    return false
  }

  // Must not be in a closed range
  if (options?.daysClosed && isDateInClosedRange(date, options.daysClosed)) {
    return false
  }

  return true
}

// ============================================================================
// REACT-DAY-PICKER MATCHERS
// ============================================================================

/**
 * Get closed days of the week as individual dates for the next 90 days
 * This handles exceptional open days correctly
 * @returns Array of dates that are closed
 */
export const getClosedWeekdayDates = (): Date[] => {
  const dates: Date[] = []
  for (let i = -6; i < 84; i++) {
    const day = addDays(new Date(), i)
    // Skip if this is an exceptional open day
    if (EXCEPTIONAL_OPEN_DAYS.some(d => isSameDay(d, day))) {
      continue
    }
    // Add if it's a normally closed day
    if (SHOP_CLOSED_DAYS.includes(getDay(day))) {
      dates.push(day)
    }
  }
  return dates
}

/**
 * Get a Matcher that disables all dates before the minimum order date
 * @returns Matcher for react-day-picker disabled prop
 */
export const getEarliestAvailableMatcher = (): Matcher => ({
  before: getMinimumOrderDate()
})

/**
 * Get a Matcher for dates that can be selected (after minimum lead time)
 * @returns Matcher for react-day-picker
 */
export const getValidDayAfterMatcher = (): Matcher => ({
  after: isPastCutoff() ? addDays(new Date(), 2) : addDays(new Date(), 1)
})

/**
 * Get all disabled day matchers combined
 * @param daysClosed Optional closed date ranges from CMS
 * @returns Array of Matchers for react-day-picker disabled prop
 */
export const getDisabledDaysMatcher = (daysClosed: DaysClosed[] = []): Matcher[] => {
  const matchers: Matcher[] = []

  // Add closed weekdays (accounting for exceptional open days)
  matchers.push(...getClosedWeekdayDates())

  // Add closed date ranges
  for (const range of daysClosed) {
    matchers.push({
      from: new Date(range.start),
      to: new Date(range.end)
    })
  }

  return matchers
}

// ============================================================================
// DATE FORMATTING
// ============================================================================

/**
 * Format a date for display to the user
 * @param date Date to format (Date object or ISO string)
 * @param locale Locale for formatting (defaults to 'en-GB')
 * @returns Formatted date string like "Wed, 25 Dec 2025"
 */
export const formatDateForDisplay = (
  date: Date | string,
  locale: string = 'en-GB'
): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return dateObj.toLocaleString(locale, {
    timeZone: AMSTERDAM_TIMEZONE,
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

/**
 * Format a date as ISO date string (YYYY-MM-DD)
 * @param date Date to format
 * @returns ISO date string
 */
export const formatDateISO = (date: Date): string => {
  return format(date, 'yyyy-MM-dd')
}

/**
 * Format current date as YYYYMMDD string for version comparison
 * @returns Date string like "20250119"
 */
export const getDateVersionString = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}${month}${day}`
}
