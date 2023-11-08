import { isAfter, isBefore, parseISO } from 'date-fns'
import { Cake } from './contentful'

export const cakeAvailable = (
  cake: Pick<Cake, 'available' | 'notAvailableStart' | 'notAvailableEnd'>
): boolean => {
  if (!cake.available) return false

  if (cake.notAvailableStart || cake.notAvailableEnd) {
    if (
      isAfter(
        new Date(),
        cake.notAvailableStart ? parseISO(cake.notAvailableStart) : new Date(1900, 1, 1)
      ) &&
      isBefore(
        new Date(),
        cake.notAvailableEnd ? parseISO(cake.notAvailableEnd) : new Date(3000, 1, 1)
      )
    ) {
      return false
    }
  }

  return true
}
