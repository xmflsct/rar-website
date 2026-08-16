import type { APIRequestContext, Page } from '@playwright/test'
import { readFileSync } from 'node:fs'

// Test fixtures and constants for e2e checkout tests

export const STRIPE_TEST_CARD = {
  number: '4242 4242 4242 4242',
  expiry: '12/34',
  cvc: '123'
}

export const TEST_SHIPPING_ADDRESS = {
  name: '[E2E] Test User',
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
  shipping: '/cake/japanese-hojicha-powder-50g',
  fullMoon: '/full-moon-box'
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

export const hideMyParcelShipment = async (request: APIRequestContext, id: string) => {
  const keyName = 'WEBHOOK_STRIPE_MYPARCEL_KEY_PREVIEW'
  const localLine = readFileSync('.dev.vars', 'utf8')
    .split('\n')
    .find((line) => line.trimStart().startsWith(keyName))
  const key =
    process.env[keyName] ||
    localLine
      ?.slice(localLine.indexOf('=') + 1)
      .trim()
      .replace(/^(['"])(.*)\1$/, '$2')

  if (!key) throw new Error('Missing WEBHOOK_STRIPE_MYPARCEL_KEY_PREVIEW')

  const response = await request.patch('https://api.myparcel.nl/shipments', {
    headers: {
      Authorization: `bearer ${btoa(key)}`,
      'Content-Type': 'application/vnd.shipment+json;charset=utf-8;version=1.1'
    },
    data: { data: { shipments: [{ id: Number(id), hidden: 1 }] } }
  })

  if (!response.ok()) throw new Error(`Unable to hide MyParcel shipment (${response.status()})`)
}
