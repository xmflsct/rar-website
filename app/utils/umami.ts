/**
 * Umami analytics tracking utilities
 * 
 * @see https://umami.is/docs/track-events
 */

// Extend window type to include umami
declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, string | number>) => void
    }
  }
}

/**
 * Track a custom event with Umami
 * Safe to call even if Umami hasn't loaded yet
 */
export function trackEvent(
  eventName: string,
  eventData?: Record<string, string | number>
): void {
  if (typeof window !== 'undefined' && window.umami) {
    window.umami.track(eventName, eventData)
  }
}

/**
 * Track product view event
 */
export function trackViewProduct(product: {
  name: string
  slug: string
  price: number
}): void {
  trackEvent('view_product', {
    product_name: product.name,
    product_slug: product.slug,
    product_price: product.price
  })
}

/**
 * Track add to cart event
 */
export function trackAddToCart(product: {
  name: string
  price: number
  quantity: number
}): void {
  trackEvent('add_to_cart', {
    product_name: product.name,
    product_price: product.price,
    quantity: product.quantity,
    cart_value: product.price * product.quantity
  })
}

/**
 * Track cart view event
 */
export function trackViewCart(data: {
  itemsCount: number
  cartTotal: number
}): void {
  trackEvent('view_cart', {
    items_count: data.itemsCount,
    cart_total: data.cartTotal
  })
}

/**
 * Track checkout initiation
 */
export function trackBeginCheckout(cartTotal: number): void {
  trackEvent('begin_checkout', {
    cart_total: cartTotal
  })
}

/**
 * Track successful purchase with revenue attribution
 */
export function trackPurchase(data: {
  orderId: string
  revenue: number
  itemsCount: number
}): void {
  trackEvent('purchase', {
    order_id: data.orderId,
    revenue: data.revenue,
    items_count: data.itemsCount
  })
}
