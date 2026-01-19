import { CakeOrder } from '~/states/bag'
import { formatDateForDisplay } from './dateHelpers'

export const getReadableDeliveryDate = (order: CakeOrder) =>
  order.chosen.delivery?.date
    ? `Set ${order.chosen.delivery.type} date: ${formatDateForDisplay(order.chosen.delivery.date)}`
    : null
