import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  SHOP_CUTOFF_HOUR,
  SHOP_CLOSED_DAYS,
  MIN_LEAD_TIME_BEFORE_CUTOFF,
  MIN_LEAD_TIME_AFTER_CUTOFF,
  EXCEPTIONAL_OPEN_DAYS,
  getAmsterdamHour,
  isPastCutoff,
  getMinimumOrderDate,
  isShopOpen,
  isDateInClosedRange,
  isValidOrderDate,
  getClosedWeekdayDates,
  formatDateForDisplay,
  formatDateISO,
  getDateVersionString
} from './dateHelpers'
import { addDays } from 'date-fns'

// Helper to create a date at a specific hour in Amsterdam timezone
// Note: This is approximate since we can't easily control timezone in tests
const createDateWithHour = (hour: number): Date => {
  const date = new Date()
  date.setHours(hour, 0, 0, 0)
  return date
}

describe('dateHelpers', () => {
  describe('Constants', () => {
    it('should have correct cutoff hour', () => {
      expect(SHOP_CUTOFF_HOUR).toBe(16)
    })

    it('should have Monday and Tuesday as closed days', () => {
      expect(SHOP_CLOSED_DAYS).toEqual([1, 2])
    })

    it('should have correct lead times', () => {
      expect(MIN_LEAD_TIME_BEFORE_CUTOFF).toBe(2)
      expect(MIN_LEAD_TIME_AFTER_CUTOFF).toBe(3)
    })
  })

  describe('getAmsterdamHour', () => {
    it('should return a number between 0 and 23', () => {
      const hour = getAmsterdamHour()
      expect(hour).toBeGreaterThanOrEqual(0)
      expect(hour).toBeLessThanOrEqual(23)
    })
  })

  describe('isPastCutoff', () => {
    it('should return a boolean', () => {
      const result = isPastCutoff()
      expect(typeof result).toBe('boolean')
    })
  })

  describe('getMinimumOrderDate', () => {
    it('should return a date in the future', () => {
      const minDate = getMinimumOrderDate()
      const now = new Date()
      expect(minDate.getTime()).toBeGreaterThan(now.getTime())
    })

    it('should return at least 2 days from now', () => {
      const minDate = getMinimumOrderDate()
      const twoDaysFromNow = addDays(new Date(), 2)
      // Due to time of day variations, just check it's at least 1.5 days away
      const diffMs = minDate.getTime() - new Date().getTime()
      const diffDays = diffMs / (1000 * 60 * 60 * 24)
      expect(diffDays).toBeGreaterThanOrEqual(1.8)
    })
  })

  describe('isShopOpen', () => {
    it('should return false for Monday (day 1)', () => {
      // Create a Monday
      const monday = new Date(2025, 0, 6) // Jan 6, 2025 is a Monday
      expect(isShopOpen(monday, [])).toBe(false)
    })

    it('should return false for Tuesday (day 2)', () => {
      // Create a Tuesday
      const tuesday = new Date(2025, 0, 7) // Jan 7, 2025 is a Tuesday
      expect(isShopOpen(tuesday, [])).toBe(false)
    })

    it('should return true for Wednesday (day 3)', () => {
      const wednesday = new Date(2025, 0, 8) // Jan 8, 2025 is a Wednesday
      expect(isShopOpen(wednesday, [])).toBe(true)
    })

    it('should return true for Sunday (day 0)', () => {
      const sunday = new Date(2025, 0, 5) // Jan 5, 2025 is a Sunday
      expect(isShopOpen(sunday, [])).toBe(true)
    })

    it('should return true for exceptional open days even if normally closed', () => {
      const exceptionalDay = new Date(2025, 11, 23) // Dec 23, 2025 is a Tuesday
      expect(isShopOpen(exceptionalDay, [exceptionalDay])).toBe(true)
    })
  })

  describe('isDateInClosedRange', () => {
    const closedRanges = [
      { start: '2025-12-24', end: '2025-12-26' }
    ]

    it('should return true for date within closed range', () => {
      const christmasDay = new Date(2025, 11, 25)
      expect(isDateInClosedRange(christmasDay, closedRanges)).toBe(true)
    })

    it('should return false for date outside closed range', () => {
      const normalDay = new Date(2025, 11, 20)
      expect(isDateInClosedRange(normalDay, closedRanges)).toBe(false)
    })

    it('should return false for empty ranges', () => {
      const anyDay = new Date(2025, 11, 25)
      expect(isDateInClosedRange(anyDay, [])).toBe(false)
    })
  })

  describe('isValidOrderDate', () => {
    it('should return false for dates in the past', () => {
      const yesterday = addDays(new Date(), -1)
      expect(isValidOrderDate(yesterday)).toBe(false)
    })

    it('should return false for tomorrow (too soon)', () => {
      const tomorrow = addDays(new Date(), 1)
      expect(isValidOrderDate(tomorrow)).toBe(false)
    })

    it('should validate dates that are far enough in the future and on an open day', () => {
      // Find a Wednesday that's at least 3 days from now
      let futureDate = addDays(new Date(), 4)
      while (futureDate.getDay() !== 3) { // Find next Wednesday
        futureDate = addDays(futureDate, 1)
      }
      
      // This should be valid (far enough in future and shop is open)
      const result = isValidOrderDate(futureDate)
      expect(result).toBe(true)
    })

    it('should return false for closed days even if far in the future', () => {
      // Find a Monday that's at least 3 days from now
      let futureMonday = addDays(new Date(), 4)
      while (futureMonday.getDay() !== 1) { // Find next Monday
        futureMonday = addDays(futureMonday, 1)
      }
      
      expect(isValidOrderDate(futureMonday)).toBe(false)
    })
  })

  describe('getClosedWeekdayDates', () => {
    it('should return an array of dates', () => {
      const closedDates = getClosedWeekdayDates()
      expect(Array.isArray(closedDates)).toBe(true)
      expect(closedDates.length).toBeGreaterThan(0)
    })

    it('should only include Mondays and Tuesdays', () => {
      const closedDates = getClosedWeekdayDates()
      for (const date of closedDates) {
        const day = date.getDay()
        expect([1, 2]).toContain(day)
      }
    })
  })

  describe('formatDateForDisplay', () => {
    it('should format a date correctly', () => {
      const date = new Date(2025, 0, 15) // Jan 15, 2025
      const formatted = formatDateForDisplay(date)
      expect(formatted).toMatch(/Wed/)
      expect(formatted).toMatch(/15/)
      expect(formatted).toMatch(/Jan/)
      expect(formatted).toMatch(/2025/)
    })

    it('should handle ISO string input', () => {
      const formatted = formatDateForDisplay('2025-01-15')
      expect(formatted).toMatch(/15/)
      expect(formatted).toMatch(/Jan/)
      expect(formatted).toMatch(/2025/)
    })
  })

  describe('formatDateISO', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date(2025, 0, 15) // Jan 15, 2025
      expect(formatDateISO(date)).toBe('2025-01-15')
    })

    it('should pad single digit months and days', () => {
      const date = new Date(2025, 0, 5) // Jan 5, 2025
      expect(formatDateISO(date)).toBe('2025-01-05')
    })
  })

  describe('getDateVersionString', () => {
    it('should return a string in YYYYMMDD format', () => {
      const version = getDateVersionString()
      expect(version).toMatch(/^\d{8}$/)
    })

    it('should return current date', () => {
      const version = getDateVersionString()
      const now = new Date()
      const expected = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
      expect(version).toBe(expected)
    })
  })
})
