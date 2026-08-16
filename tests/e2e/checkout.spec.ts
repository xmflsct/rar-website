import { test, expect, Page } from '@playwright/test'
import { appendFileSync } from 'node:fs'
import {
  STRIPE_TEST_CARD,
  TEST_PRODUCT_PATHS,
  TEST_SHIPPING_ADDRESS,
  TEST_EMAIL,
  TEST_PHONE,
  hideMyParcelShipment,
  openAdminOrders
} from './fixtures'

/**
 * Helper to complete the Stripe payment form
 * Stripe Checkout has inputs directly in the DOM (not iframes)
 */
async function completeStripePayment(
  page: Page,
  options: { withShipping?: boolean } = {}
) {
  // Wait for Stripe checkout to load
  await page.waitForURL(/checkout\.stripe\.com/, { timeout: 60000 })
  
  // Wait for the page to load - use domcontentloaded since Stripe keeps connections open
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(2000)

  // Fill email - Stripe checkout uses input#email
  const emailInput = page.locator('input#email')
  await emailInput.fill(TEST_EMAIL)

  // Fill phone number if visible
  const phoneInput = page.locator('input[type="tel"]').first()
  if (await phoneInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await phoneInput.fill(TEST_PHONE)
  }

  // Fill shipping address if required
  if (options.withShipping) {
    // Allow time for shipping section to render
    await page.waitForTimeout(1000)
    
    // Click "Enter address manually" button if it exists to expand the form
    const manualAddressButton = page.locator('button:has-text("Enter address manually")')
    if (await manualAddressButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await manualAddressButton.click()
      await page.waitForTimeout(1000)
    }
    
    // Fill shipping name (use exact Stripe selector)
    const nameInput = page.locator('input#shippingName')
    await nameInput.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
    if (await nameInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await nameInput.fill(TEST_SHIPPING_ADDRESS.name)
    }
    
    // Fill shipping address line 1 (use exact Stripe selector)
    const addressInput = page.locator('input#shippingAddressLine1')
    await addressInput.waitFor({ state: 'visible', timeout: 3000 }).catch(() => {})
    if (await addressInput.isVisible({ timeout: 1000 }).catch(() => false)) {
      await addressInput.fill(TEST_SHIPPING_ADDRESS.addressLine1)
      await page.waitForTimeout(300) // Allow address autocomplete to dismiss
    }
    
    // Fill city (use exact Stripe selector)
    const cityInput = page.locator('input#shippingLocality')
    if (await cityInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cityInput.fill(TEST_SHIPPING_ADDRESS.city)
    }
    
    // Fill postal code (use exact Stripe selector)
    const postalInput = page.locator('input#shippingPostalCode')
    if (await postalInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await postalInput.fill(TEST_SHIPPING_ADDRESS.postalCode)
    }
    
    await page.waitForTimeout(500)
  }

  // Select Card payment method - try multiple approaches
  // First scroll down to make the payment methods visible
  await page.evaluate(() => window.scrollBy(0, 300))
  await page.waitForTimeout(500)
  
  // Try to click the Card payment option using different methods
  // Method 1: Click the Card radio input via JavaScript (most reliable)
  await page.evaluate(() => {
    const cardRadio = document.querySelector('input#payment-method-accordion-item-title-card') as HTMLInputElement
    if (cardRadio) {
      cardRadio.checked = true
      cardRadio.dispatchEvent(new Event('change', { bubbles: true }))
      cardRadio.click()
    }
  })
  await page.waitForTimeout(500)
  
  // Method 2: Also click the visible Card label/button area
  const cardLabel = page.locator('#payment-method-label-card, [data-testid="card-accordion-item-button"]').first()
  if (await cardLabel.isVisible({ timeout: 1000 }).catch(() => false)) {
    await cardLabel.click({ force: true })
  }
  await page.waitForTimeout(1000)

  // Wait for card fields to appear and fill them
  // These inputs are directly in the DOM on Stripe Checkout
  const cardNumberInput = page.locator('input#cardNumber')
  await cardNumberInput.waitFor({ state: 'visible', timeout: 10000 })
  await cardNumberInput.fill(STRIPE_TEST_CARD.number)

  // Fill expiry
  const expiryInput = page.locator('input#cardExpiry')
  await expiryInput.fill(STRIPE_TEST_CARD.expiry)

  // Fill CVC
  const cvcInput = page.locator('input#cardCvc')
  await cvcInput.fill(STRIPE_TEST_CARD.cvc)

  // Fill cardholder name if visible
  const billingNameInput = page.locator('input#billingName')
  if (await billingNameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await billingNameInput.fill(TEST_SHIPPING_ADDRESS.name)
  }

  // Keep Stripe's card validation deterministic across runner locales.
  const billingCountrySelect = page
    .locator('select#billingCountry, select[name="billingCountry"], select[name="billingAddressCountry"]')
    .first()
  if (await billingCountrySelect.isVisible({ timeout: 2000 }).catch(() => false)) {
    await billingCountrySelect.selectOption('US')
  }

  // Fill billing postal code (ZIP) if visible - Stripe may require this for card validation
  // The input may have various names depending on the Stripe checkout version
  const billingPostalInput = page
    .locator('input#billingPostalCode, input[name="billingPostalCode"], input[name="billingAddressPostalCode"]')
    .first()
  if (await billingPostalInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await billingPostalInput.fill('12345')
  }

  // Click pay button
  await page.waitForTimeout(500)
  const payButton = page.locator('button.SubmitButton')
  await payButton.click()

  // Wait for redirect back to thank-you page
  await page.waitForURL(/thank-you\/id\//, { timeout: 90000 })
  const sessionId = new URL(page.url()).pathname.split('/').at(-1)
  if (!sessionId?.startsWith('cs_')) throw new Error('Checkout did not return a session ID')
  if (process.env.ADMIN_ORDERS_SESSION_FILE) {
    appendFileSync(process.env.ADMIN_ORDERS_SESSION_FILE, `${sessionId}\n`)
  }
  return sessionId
}

/**
 * Helper to navigate to a specific cake page and add to bag
 */
async function addCakeToBag(page: Page, options: {
  cakeType: keyof typeof TEST_PRODUCT_PATHS
  selectAmount?: number
  deliveryType?: 'pickup' | 'shipping'
}) {
  const { cakeType, selectAmount = 1, deliveryType } = options

  await page.goto(TEST_PRODUCT_PATHS[cakeType])

  await page.waitForLoadState('networkidle')

  const amountSelect = page.locator('select[name="amount"]')
  const isAvailable = await amountSelect.isVisible({ timeout: 5000 }).catch(() => false)

  if (!isAvailable) {
    throw new Error(`No available ${cakeType} product found to add to bag.`)
  }

  // If a delivery option is needed, select the delivery type and any required date.
  if (deliveryType) {
    const deliverySelect = page.locator('select[name="delivery"]')
    if (await deliverySelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await deliverySelect.selectOption(deliveryType)
      await page.waitForTimeout(500)

      const dateInput = page.locator('input[placeholder="Select date ..."]')
      if (await dateInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await dateInput.click()
        await page.waitForTimeout(500)

        const availableDay = page.locator('button.rdp-day_button:not([disabled])').first()
        if (await availableDay.isVisible({ timeout: 3000 }).catch(() => false)) {
          await availableDay.click()
          await page.waitForTimeout(500)
        }
      }
    }
  }

  // Select amount
  await amountSelect.selectOption(selectAmount.toString())

  // Handle any customization selects (e.g., "Paper tag" on birthday cakes and some normal cakes)
  // Look for selects that have a placeholder option with "..." indicating they need selection
  const customSelects = page.locator('select').filter({ has: page.locator('option:has-text("...")') })
  const count = await customSelects.count()

  for (let j = 0; j < count; j++) {
    const select = customSelects.nth(j)
    const selectName = await select.getAttribute('name')
    // Skip standard selects
    if (selectName === 'amount' || selectName === 'unit' || selectName === 'delivery') continue

    // Get all options except disabled ones
    const options = select.locator('option:not([disabled])')
    const optionCount = await options.count()
    if (optionCount > 0) {
      const firstValue = await options.first().getAttribute('value')
      if (firstValue) {
        await select.selectOption(firstValue)
      }
    }
  }

  // Click "Add to bag"
  await page.getByRole('button', { name: 'Add to bag' }).click()

  // Wait for the bag to update
  await page.waitForTimeout(500)
}

/**
 * Helper to complete checkout from shopping bag
 */
async function completeCheckoutFromBag(page: Page, options: {
  hasPickupItems?: boolean
  hasShippingItems?: boolean
}) {
  // Navigate to shopping bag
  await page.goto('/shopping-bag')
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('heading', { name: 'Shopping bag' })).toBeVisible()

  // Wait for any content to load
  await page.waitForTimeout(1000)

  // If there are pickup items, we need to select a pickup date
  if (options.hasPickupItems) {
    // The date picker is an input with placeholder "Select date ..."
    const dateInput = page.locator('input[placeholder="Select date ..."]')
    
    if (await dateInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Click to open the calendar popover
      await dateInput.click()
      await page.waitForTimeout(500)
      
      // Wait for calendar to appear and select first ENABLED day button
      // React Day Picker v9 uses .rdp-day_button for clickable days
      // Disabled days have disabled attribute - we need to filter them out
      const availableDay = page.locator('button.rdp-day_button:not([disabled])').first()
      
      if (await availableDay.isVisible({ timeout: 3000 }).catch(() => false)) {
        await availableDay.click()
        await page.waitForTimeout(500)
      }
    }
  }

  // If there are shipping items, select country
  if (options.hasShippingItems) {
    const countrySelect = page.locator('select[name="countryCode"]')
    if (await countrySelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await countrySelect.selectOption('NLD')
      await page.waitForTimeout(300)
    }
  }

  // Accept terms checkbox - click on the text to toggle
  const termsCheckbox = page.getByText('I have read and understood the cancellation policy')
  await termsCheckbox.click()
  
  // Verify checkbox is now checked
  await page.waitForTimeout(300)

  // Click checkout button
  const checkoutButton = page.getByRole('button', { name: 'Checkout' })
  await checkoutButton.click()
}

test.describe('Checkout E2E Tests', () => {
  test.describe.configure({ mode: 'serial' })
  let ordersSince = 0
  let adminOrderIds: string[] = []

  test.beforeAll(() => {
    ordersSince = Math.floor(Date.now() / 1000) - 2
    adminOrderIds = []
  })

  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start fresh
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
  })

  test('1. Purchase a normal cake roll', async ({ page }) => {
    // Add a normal cake (from Cakes & Sweets) to bag
    await addCakeToBag(page, { cakeType: 'normal', selectAmount: 1 })

    // Complete checkout
    await completeCheckoutFromBag(page, { hasPickupItems: true })

    // Complete Stripe payment
    adminOrderIds.push(await completeStripePayment(page))

    // Verify thank you page
    await expect(page.getByText(/thank you for your order/i)).toBeVisible()
  })

  test('2. Purchase a birthday cake', async ({ page }) => {
    // Add a birthday cake to bag (includes printed tag selection)
    await addCakeToBag(page, { cakeType: 'birthday', selectAmount: 1 })

    // Complete checkout
    await completeCheckoutFromBag(page, { hasPickupItems: true })

    // Complete Stripe payment
    adminOrderIds.push(await completeStripePayment(page))

    // Verify thank you page
    await expect(page.getByText(/thank you for your order/i)).toBeVisible()
  })

  test('3. Purchase a shippable product with pickup in store', async ({ page }) => {
    // Add shippable product with pickup to bag
    await addCakeToBag(page, { 
      cakeType: 'shipping',
      selectAmount: 1,
      deliveryType: 'pickup'
    })

    // Complete checkout
    await completeCheckoutFromBag(page, { hasPickupItems: true })

    // Complete Stripe payment
    adminOrderIds.push(await completeStripePayment(page))

    // Verify thank you page
    await expect(page.getByText(/thank you for your order/i)).toBeVisible()
  })

  test('Admin orders loads later pages without losing or duplicating rows', async ({
    page,
    baseURL
  }) => {
    const params = new URLSearchParams({
      since: ordersSince.toString(),
      until: Math.floor(Date.now() / 1000).toString(),
      pageSize: '2'
    })
    await openAdminOrders(page, baseURL, params)

    const rows = page.locator('tbody tr[data-order-id]')
    await expect(rows).toHaveCount(2)
    const initialIds = await rows.evaluateAll((elements) =>
      elements.map((element) => element.getAttribute('data-order-id'))
    )

    await page.getByRole('button', { name: 'Load more', exact: true }).click()
    await expect(rows).toHaveCount(3)
    await expect(page.getByText('The end', { exact: true })).toBeVisible()

    const loadedIds = await rows.evaluateAll((elements) =>
      elements.map((element) => element.getAttribute('data-order-id'))
    )
    expect(new Set(loadedIds).size).toBe(loadedIds.length)
    expect(initialIds.every((id) => loadedIds.includes(id))).toBe(true)
    expect(adminOrderIds.every((id) => loadedIds.includes(id))).toBe(true)
  })

  /*
   * Gift card purchase flows are temporarily disabled because the current CMS
   * gift-card page no longer exposes a purchasable order form. Re-enable these
   * when gift cards are introduced back as an orderable item.
   *
   * test('3. Purchase a giftcard with pickup in store', async ({ page }) => {
   *   await addCakeToBag(page, {
   *     cakeType: 'giftcard',
   *     selectAmount: 1,
   *     deliveryType: 'pickup'
   *   })
   *
   *   await completeCheckoutFromBag(page, { hasPickupItems: true })
   *   await completeStripePayment(page)
   *   await expect(page.getByText(/thank you for your order/i)).toBeVisible()
   * })
   *
   * test('4. Purchase a giftcard with delivery to Netherlands', async ({ page }) => {
   *   await addCakeToBag(page, {
   *     cakeType: 'giftcard',
   *     selectAmount: 1,
   *     deliveryType: 'shipping'
   *   })
   *
   *   await completeCheckoutFromBag(page, { hasShippingItems: true })
   *   await completeStripePayment(page, { withShipping: true })
   *   await expect(page.getByText(/thank you for your order/i)).toBeVisible()
   * })
   *
   * test('5. Purchase a birthday cake AND a giftcard with delivery', async ({ page }) => {
   *   await addCakeToBag(page, { cakeType: 'birthday', selectAmount: 1 })
   *   await addCakeToBag(page, {
   *     cakeType: 'giftcard',
   *     selectAmount: 1,
   *     deliveryType: 'shipping'
   *   })
   *
   *   await completeCheckoutFromBag(page, {
   *     hasPickupItems: true,
   *     hasShippingItems: true
   *   })
   *   await completeStripePayment(page, { withShipping: true })
   *   await expect(page.getByText(/thank you for your order/i)).toBeVisible()
   * })
   */

  test('4. Purchase a shippable product with delivery to Netherlands', async ({ page }) => {
    // Add shippable product with shipping to bag
    await addCakeToBag(page, { 
      cakeType: 'shipping',
      selectAmount: 1,
      deliveryType: 'shipping'
    })

    // Complete checkout with shipping
    await completeCheckoutFromBag(page, { hasShippingItems: true })

    // Complete Stripe payment with shipping address
    await completeStripePayment(page, { withShipping: true })

    // Verify thank you page
    await expect(page.getByText(/thank you for your order/i)).toBeVisible()
  })

  test('5. Purchase a birthday cake AND a shippable product with delivery', async ({ page }) => {
    // First: Add birthday cake (pickup)
    await addCakeToBag(page, { cakeType: 'birthday', selectAmount: 1 })

    // Second: Add shippable product with shipping
    await addCakeToBag(page, { 
      cakeType: 'shipping',
      selectAmount: 1,
      deliveryType: 'shipping'
    })

    // Complete checkout with both pickup and shipping items
    await completeCheckoutFromBag(page, { 
      hasPickupItems: true, 
      hasShippingItems: true 
    })

    // Complete Stripe payment with shipping address
    await completeStripePayment(page, { withShipping: true })

    // Verify thank you page
    await expect(page.getByText(/thank you for your order/i)).toBeVisible()
  })

  test('6. Full Moon Box can be collected without a shipping fee', async ({ page }) => {
    await addCakeToBag(page, {
      cakeType: 'fullMoon',
      selectAmount: 1,
      deliveryType: 'pickup'
    })

    await page.goto('/shopping-bag')
    await expect(page.getByText('Happy Full Moon Box', { exact: true })).toBeVisible()
    await expect(page.getByRole('row', { name: /Shipping fee/ })).toHaveCount(0)
    await expect(page.getByRole('row', { name: /Total/ })).toContainText('€ 32,00')
  })

  for (const scenario of [
    { amount: 1, shipping: '€ 7,00', total: '€ 39,00', name: 'paid shipping' },
    { amount: 3, shipping: 'Free', total: '€ 96,00', name: 'free shipping' }
  ]) {
    test(`Full Moon Box with ${scenario.name} has a retrievable admin label`, async ({
      page,
      baseURL,
      request
    }) => {
      await addCakeToBag(page, {
        cakeType: 'fullMoon',
        selectAmount: scenario.amount,
        deliveryType: 'shipping'
      })

      await page.goto('/shopping-bag')
      await page.locator('select[name="countryCode"]').selectOption('NLD')
      await expect(page.getByText('Happy Full Moon Box', { exact: true })).toBeVisible()
      await expect(page.getByRole('row', { name: /Shipping fee/ })).toContainText(scenario.shipping)
      await expect(page.getByRole('row', { name: /Total/ })).toContainText(scenario.total)

      await completeCheckoutFromBag(page, { hasShippingItems: true })
      const sessionId = await completeStripePayment(page, { withShipping: true })
      await expect(page.getByText(/thank you for your order/i)).toBeVisible()

      await openAdminOrders(
        page,
        baseURL,
        new URLSearchParams({ since: (Math.floor(Date.now() / 1000) - 600).toString() })
      )

      const row = page.locator(`tbody tr[data-order-id="${sessionId}"]`)
      await expect(row).toBeVisible()
      await expect(row).toContainText('Happy Full Moon Box')
      await expect(row).toContainText('[E2E] Test User')
      await expect(row).toContainText(/Hoogstraat 55A\s*, 3011 PG, Rotterdam/)

      const labelLink = row.locator('a[href^="/admin/shipping-label/"]')
      if (!(await labelLink.isVisible())) {
        await row.getByRole('button', { name: 'Retry', exact: true }).click()
      }
      await expect(labelLink).toBeVisible({ timeout: 90000 })
      const labelHref = await labelLink.getAttribute('href')
      expect(labelHref).toMatch(/^\/admin\/shipping-label\/\d+$/)
      const shipmentId = labelHref!.split('/').at(-1)!

      try {
        const label = await page.evaluate(async (href) => {
          const response = await fetch(href)
          const bytes = new Uint8Array(await response.arrayBuffer())
          return {
            status: response.status,
            contentType: response.headers.get('content-type'),
            magic: new TextDecoder().decode(bytes.slice(0, 5)),
            size: bytes.length
          }
        }, labelHref!)

        expect(label).toMatchObject({
          status: 200,
          contentType: 'application/pdf',
          magic: '%PDF-'
        })
        expect(label.size).toBeGreaterThan(1000)
      } finally {
        await hideMyParcelShipment(request, shipmentId)
      }
    })
  }
})
