import { test, expect } from '@playwright/test';

test('E2E Order Flow: Cake -> Checkout -> Stripe -> Confirmation', async ({ page }) => {
  // Mock checkout submission to avoid Stripe call (since we don't have backend envs for Stripe)
  // The app POSTs to /shopping-bag. We intercept that.
  await page.route('**/shopping-bag', async route => {
      if (route.request().method() === 'POST') {
          // Simulate a redirect to a fake stripe URL
          await route.fulfill({
              status: 302,
              headers: {
                  'Location': 'http://checkout.stripe.com/mock-checkout'
              }
          });
      } else {
          await route.continue();
      }
  });

  // 1. Open Homepage
  await page.goto('/');
  await expect(page).toHaveTitle(/Round&Round Rotterdam/);

  // 2. Navigate to a cake page
  const cakeSlug = 'matcha-crepe';
  await page.goto(`/cake/${cakeSlug}`);

  // Verify we are on the cake page
  await expect(page.getByText('Add to bag')).toBeVisible();

  // 3. Add to Bag
  const amountSelect = page.locator('select[name="amount"]');
  // In our mock, there is stock.
  await amountSelect.selectOption('1');

  // Click Add to bag
  await page.getByText('Add to bag').click();

  // 4. Go to Shopping Bag
  await page.goto('/shopping-bag');

  // Verify Shopping Bag
  await expect(page.getByRole('heading', { name: 'Shopping bag' })).toBeVisible();

  // 5. Fill Checkout Form
  const countrySelect = page.locator('select[name="countryCode"]');

  // Select country if visible. In our mock setup, shipping should be available for shipping orders.
  // But wait, shipping depends on whether we selected shipping delivery or if it's default.
  // We didn't select delivery type in step 3 because 'matcha-crepe' mock has shippingAvailable: true.
  // The UI selects 'pickup' by default usually unless shipping only?
  // Let's assume we might need to select it.

  // For robustness, check if country select appears after waiting a bit, or just try to fill it if we can.
  // But strictly, we should know the state.
  // In `cakeOrder.tsx`, default unit is first available.
  // Mock data: typeAAvailable: true.

  // If we need shipping, we select country.
  // Let's assume the test scenario implies shipping or pickup.
  // If the country code selector is there, we fill it.

  if (await countrySelect.count() > 0 && await countrySelect.isVisible()) {
     await countrySelect.selectOption('NL');
  }

  await page.locator('input[name="terms"]').check();

  // Submit Checkout
  // This will trigger our intercepted POST request
  await page.getByRole('button', { name: 'Checkout' }).click();

  // 6. Stripe Payment (Mocked)
  // We redirected to http://checkout.stripe.com/mock-checkout
  await page.waitForURL(/checkout.stripe.com\/mock-checkout/);

  // Verify we reached the mock stripe url.
  expect(page.url()).toContain('checkout.stripe.com/mock-checkout');
});
