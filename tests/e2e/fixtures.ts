import type { Page } from '@playwright/test'

// Test fixtures and constants for e2e checkout tests

export const STRIPE_TEST_CARD = {
  number: '4242 4242 4242 4242',
  expiry: '12/34',
  cvc: '123'
}

export const TEST_SHIPPING_ADDRESS = {
  name: 'Test User',
  addressLine1: 'Hoogstraat 55A',
  city: 'Rotterdam',
  postalCode: '3011 PG',
  country: 'Netherlands'
}

export const TEST_EMAIL = 'test@example.com'
export const TEST_PHONE = '+31612345678'

export const TEST_PRODUCT_PATHS = {
  normal: '/cake/may-roll',
  birthday: '/cake/birthday-cake-no-6',
  shipping: '/cake/japanese-hojicha-powder-50g'
}

export const openAdminOrders = async (
  page: Page,
  baseURL: string | undefined,
  searchParams: URLSearchParams
) => {
  const clientId = process.env.CF_ACCESS_CLIENT_ID
  const clientSecret = process.env.CF_ACCESS_CLIENT_SECRET
  if (baseURL && clientId && clientSecret) {
    await page.route(`${new URL(baseURL).origin}/admin/**`, async (route) => {
      await route.continue({
        headers: {
          ...route.request().headers(),
          'CF-Access-Client-Id': clientId,
          'CF-Access-Client-Secret': clientSecret
        }
      })
    })
  }

  await page.goto(`/admin/orders?${searchParams}`)
}
