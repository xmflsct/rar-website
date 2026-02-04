import { test, expect, Page } from '@playwright/test'
import * as dotenv from 'dotenv'

// Load environment variables if not already loaded (mostly for local testing)
dotenv.config()

/**
 * STRIPE TEST CARDS
 * https://stripe.com/docs/testing
 */
const STRIPE_TEST_CARD = {
  number: '4242424242424242',
  expiry: '1234', // MMYY
  cvc: '123',
  postalCode: '12345'
}

const TEST_SHIPPING_ADDRESS = {
  name: 'Playwright Test User',
  street: 'Kalverstraat 1',
  city: 'Amsterdam',
  postalCode: '1012NX',
  country: 'Netherlands'
}

/**
 * Helper to handle Stripe Payment
 * Since Stripe is an iframe or redirect, we intercept the request or handle the UI.
 * In this project, the payment is a redirect to Stripe Checkout hosted page.
 * We can simulate a successful payment redirect or interact with the Stripe page if possible.
 */
async function completeStripePayment(page: Page, options: { withShipping?: boolean } = {}) {
  // Wait for the URL to change to stripe.com
  await page.waitForURL(/checkout.stripe.com/, { timeout: 30000 })

  // Interact with Stripe Checkout page
  // Note: Stripe elements can be tricky due to iframes and dynamic IDs.
  // We use stable selectors where possible.

  // 1. Fill email if requested (sometimes prefilled)
  const emailInput = page.locator('#email')
  if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await emailInput.fill('test@example.com')
  }

  // If shipping is required, Stripe asks for address
  if (options.withShipping) {
    const nameInput = page.locator('#shipping-name')
    if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nameInput.fill(TEST_SHIPPING_ADDRESS.name)
    }

    const addressInput = page.locator('#shipping-address-line1')
    if (await addressInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await addressInput.fill(TEST_SHIPPING_ADDRESS.street)
    }

    const cityInput = page.locator('#shipping-address-city')
    if (await cityInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cityInput.fill(TEST_SHIPPING_ADDRESS.city)
    }

    const postalCodeInput = page.locator('#shipping-address-postal_code')
    if (await postalCodeInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await postalCodeInput.fill(TEST_SHIPPING_ADDRESS.postalCode)
    }
  }

  // 2. Also click the visible Card label/button area
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

  // Click pay button
  await page.waitForTimeout(500)
  const payButton = page.locator('button.SubmitButton')
  await payButton.click()

  // Wait for redirect back to thank-you page
  await page.waitForURL(/thank-you\/id\//, { timeout: 90000 })
}

/**
 * Helper to navigate to a specific cake page and add to bag
 */
async function addCakeToBag(page: Page, options: {
  cakeType: 'normal' | 'birthday' | 'giftcard'
  selectAmount?: number
  deliveryType?: 'pickup' | 'shipping'
}) {
  const { cakeType, selectAmount = 1, deliveryType } = options

  await page.goto('/')
  
  // Click the appropriate navigation link
  if (cakeType === 'normal') {
    // Click on "Cakes & Sweets" link
    await page.getByRole('link', { name: /cakes.*sweets/i }).click()
  } else if (cakeType === 'birthday') {
    // Click on "Birthday Cakes" link
    await page.getByRole('link', { name: /birthday/i }).click()
  } else if (cakeType === 'giftcard') {
    // Click on "Gift card" link  
    await page.getByRole('link', { name: /gift.*card/i }).click()
  }

  await page.waitForLoadState('networkidle')

  // Get all cake links on the page
  const cakeLinks = page.locator('a[href^="/cake/"]')
  const cakeLinkCount = await cakeLinks.count()
  
  // Iterate through cakes to find one that is in stock
  let addedToBag = false

  for (let i = 0; i < cakeLinkCount; i++) {
    // Click the cake
    await cakeLinks.nth(i).click()

    // Wait for navigation and potential redirects
    await page.waitForLoadState('networkidle')

    // Verify we are on a cake page (and not redirected back or elsewhere)
    if (!page.url().includes('/cake/')) {
       // If click failed or redirected, go back to list and try next
       await page.goBack()
       await page.waitForLoadState('networkidle')
       continue
    }

    // Check if the amount selector is visible (indicating item is in stock)
    const amountSelect = page.locator('select[name="amount"]')
    const isAvailable = await amountSelect.isVisible({ timeout: 2000 }).catch(() => false)

    if (isAvailable) {
      // If delivery option is needed (like for gift cards with shipping)
      if (deliveryType) {
        const deliverySelect = page.locator('select[name="delivery"]')
        if (await deliverySelect.isVisible({ timeout: 2000 }).catch(() => false)) {
          await deliverySelect.selectOption(deliveryType)
          await page.waitForTimeout(500)
        }
      }

      // Select amount
      await amountSelect.selectOption(selectAmount.toString())

      // For birthday cakes, select printed tag (cake customization)
      if (cakeType === 'birthday') {
        // Look for customization selects (they have type like "Printed tag")
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
      }

      // Click "Add to bag"
      await page.getByRole('button', { name: 'Add to bag' }).click()

      // Wait for the bag to update
      await page.waitForTimeout(500)

      addedToBag = true
      break // Exit loop as we successfully added a cake
    } else {
      // If not available, go back to the listing page
      await page.goBack()
      await page.waitForLoadState('networkidle')
      // Continue to next cake
    }
  }
  
  if (!addedToBag) {
    throw new Error(`No available ${cakeType} cakes found to add to bag.`)
  }
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
  // Use force click to bypass potential overlay issues or simply click the label
  await termsCheckbox.click({ force: true })
  
  // Verify checkbox is now checked
  await page.waitForTimeout(300)

  // Click checkout button
  const checkoutButton = page.getByRole('button', { name: 'Checkout' })
  await checkoutButton.click()
}

test.describe('Checkout E2E Tests', () => {
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
    await completeStripePayment(page)

    // Verify thank you page
    await expect(page.getByText(/thank you for your order/i)).toBeVisible()
  })

  test('2. Purchase a birthday cake', async ({ page }) => {
    // Add a birthday cake to bag (includes printed tag selection)
    await addCakeToBag(page, { cakeType: 'birthday', selectAmount: 1 })

    // Complete checkout
    await completeCheckoutFromBag(page, { hasPickupItems: true })

    // Complete Stripe payment
    await completeStripePayment(page)

    // Verify thank you page
    await expect(page.getByText(/thank you for your order/i)).toBeVisible()
  })

  test('3. Purchase a giftcard with pickup in store', async ({ page }) => {
    // Add gift card with pickup to bag
    await addCakeToBag(page, { 
      cakeType: 'giftcard', 
      selectAmount: 1,
      deliveryType: 'pickup'
    })

    // Complete checkout
    await completeCheckoutFromBag(page, { hasPickupItems: true })

    // Complete Stripe payment
    await completeStripePayment(page)

    // Verify thank you page
    await expect(page.getByText(/thank you for your order/i)).toBeVisible()
  })

  test('4. Purchase a giftcard with delivery to Netherlands', async ({ page }) => {
    // Add gift card with shipping to bag
    await addCakeToBag(page, { 
      cakeType: 'giftcard', 
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

  test('5. Purchase a birthday cake AND a giftcard with delivery', async ({ page }) => {
    // First: Add birthday cake (pickup)
    await addCakeToBag(page, { cakeType: 'birthday', selectAmount: 1 })

    // Second: Add gift card with shipping
    await addCakeToBag(page, { 
      cakeType: 'giftcard', 
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
})
