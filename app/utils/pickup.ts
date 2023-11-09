import { isAfter, parseISO } from 'date-fns';
import { Cake } from './contentful';

// In case start and end dates are reversed
export const correctPickup = (
  cake: Pick<Cake, 'pickupNotAvailableStart' | 'pickupNotAvailableEnd'>
): { start: Cake['pickupNotAvailableStart']; end: Cake['pickupNotAvailableEnd'] } => {
  if (cake.pickupNotAvailableStart && cake.pickupNotAvailableEnd) {
    if (isAfter(parseISO(cake.pickupNotAvailableStart), parseISO(cake.pickupNotAvailableEnd))) {
      return { start: cake.pickupNotAvailableEnd, end: cake.pickupNotAvailableStart }
    }
  }
  return { start: cake.pickupNotAvailableStart, end: cake.pickupNotAvailableEnd }
}
