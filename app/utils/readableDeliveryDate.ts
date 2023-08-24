import { parseISO } from 'date-fns'
import { CakeOrder } from '~/states/bag'

export const getReadableDeliveryDate = (order: CakeOrder) =>
  order.chosen.delivery?.date
    ? `Set ${order.chosen.delivery.type} date: ${parseISO(order.chosen.delivery.date).toLocaleString(
        'en-GB',
        {
          timeZone: 'Europe/Amsterdam',
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }
      )}`
    : null
