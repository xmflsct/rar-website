import { test, expect } from '@playwright/test';

test('E2E Order Flow: Cake -> Checkout -> Stripe -> Confirmation', async ({ page }) => {
  // 1. Open Homepage
  await page.goto('/');
  await expect(page).toHaveTitle(/Round&Round Rotterdam/);

  // 2. Navigate to a cake page
  // We'll browse from the homepage to find a cake, making it robust against slug changes.

  // Try to find "Cakes" in navigation if it exists.
  const cakesLink = page.getByRole('link', { name: /Cake/i }).first();
  if (await cakesLink.count() > 0 && await cakesLink.isVisible()) {
      await cakesLink.click();
  } else {
      // Fallback: try to go to /cake/matcha-crepe or /cakes if link not found.
      await page.goto('/cake/matcha-crepe');
  }

  // If we are on a list page, click a product.
  // Check if we are on a product page (has "Add to bag") or list page.
  const addToBagBtn = page.getByText('Add to bag');
  if (await addToBagBtn.count() === 0) {
      // We might be on a list page. Click the first product.
      // Assuming product cards are links.
      // Look for links containing "/cake/"
      const productLink = page.locator('a[href*="/cake/"]').first();
      await productLink.click();
  }

  // Verify we are on a cake page
  await expect(page.getByText('Add to bag')).toBeVisible();

  // 3. Add to Bag
  const amountSelect = page.locator('select[name="amount"]');
  // Select '1' if available.
  await amountSelect.selectOption('1');

  // Click Add to bag
  await page.getByText('Add to bag').click();

  // 4. Go to Shopping Bag
  await page.goto('/shopping-bag');

  // Verify Shopping Bag
  await expect(page.getByRole('heading', { name: 'Shopping bag' })).toBeVisible();

  // 5. Fill Checkout Form
  const countrySelect = page.locator('select[name="countryCode"]');

  // Fill country if visible (shipping)
  if (await countrySelect.count() > 0 && await countrySelect.isVisible()) {
     await countrySelect.selectOption('NL');
  }

  await page.locator('input[name="terms"]').check();

  // Submit Checkout
  // This will submit the form to the backend, which talks to Contentful and Stripe.
  await page.getByRole('button', { name: 'Checkout' }).click();

  // 6. Stripe Payment (Real)
  // We expect a redirection to Stripe Hosted Checkout.
  // This waits for the URL to change to the Stripe domain.
  await page.waitForURL(/checkout.stripe.com/);

  // Fill Stripe Email
  // Stripe Hosted Checkout usually has an email field visible.
  await page.locator('#email').fill('test@example.com');

  // Fill Card Details
  // Card Number
  // Use a test card: 4242 4242 4242 4242
  await page.locator('#cardNumber').fill('4242424242424242');

  // Expiry
  await page.locator('#cardExpiry').fill('1234'); // MM / YY

  // CVC
  await page.locator('#cardCvc').fill('123');

  // Name on card
  await page.locator('#billingName').fill('Test User');

  // Click Pay
  await page.getByRole('button', { name: /Pay/ }).click();

  // 7. Verify Confirmation
  // Should redirect back to the app's thank you page.
  await page.waitForURL(/thank-you/, { timeout: 30000 });

  // Check for confirmation message
  await expect(page.getByText('Thank you')).toBeVisible();
});
