import { test, expect } from '@playwright/test';

test('E2E Order Flow: Cake -> Checkout -> Stripe -> Confirmation', async ({ page }) => {
  // 1. Open Homepage
  await page.goto('/');
  await expect(page).toHaveTitle(/Round&Round Rotterdam/);

  // 2. Navigate to a cake page
  // We'll use a known slug "matcha-crepe" as established in previous analysis.
  // In a real scenario, we might want to click a link from the home page.
  const cakeSlug = 'matcha-crepe';
  await page.goto(`/cake/${cakeSlug}`);

  // Verify we are on the cake page
  await expect(page.getByText('Add to bag')).toBeVisible();

  // 3. Add to Bag
  // Select amount (if needed, usually defaults to empty or requires selection)
  // Based on `cakeOrder.tsx`, amount is a select.
  const amountSelect = page.locator('select[name="amount"]');
  // Check if amount select exists and select '1'
  if (await amountSelect.isVisible()) {
      await amountSelect.selectOption('1');
  }

  // Click Add to bag
  await page.getByText('Add to bag').click();

  // 4. Go to Shopping Bag
  // Usually there's a notification or we manually navigate.
  await page.goto('/shopping-bag');

  // Verify Shopping Bag
  await expect(page.getByRole('heading', { name: 'Shopping bag' })).toBeVisible();

  // 5. Fill Checkout Form

  // Country (if shipping is selected/default)
  const countrySelect = page.locator('select[name="countryCode"]');
  if (await countrySelect.isVisible()) {
      await countrySelect.selectOption('NL'); // Netherlands
  }

  // Terms & Conditions
  await page.locator('input[name="terms"]').check();

  // Submit Checkout
  await page.getByRole('button', { name: 'Checkout' }).click();

  // 6. Stripe Payment
  // This usually redirects to a Stripe URL.
  await page.waitForURL(/checkout.stripe.com/, { timeout: 20000 });

  // Wait for Stripe page to load email input (common in Hosted Checkout)
  // Hosted Checkout is a single page app, usually no iframes for the main fields like email.
  await expect(page.locator('#email')).toBeVisible();

  // Fill Email
  await page.locator('#email').fill('test@example.com');

  // Fill Card Details
  // Stripe Hosted Checkout typically runs card elements directly in the page structure
  // OR creates distinct iframes for sensitive fields.
  // However, for Stripe Checkout (redirect), the fields are often accessible directly by ID or
  // aria-label if it's the newer "Link" optimized checkout.
  // If they are in iframes, we need to locate the frame.

  // Try to find if card number is in an iframe.
  // Common IDs: #cardNumber, #cardExpiry, #cardCvc
  // If not found, try finding generic card input.

  // Note: Stripe's testing docs suggest standard locators often work for Hosted Checkout
  // but if it's Elements, it's different. Since we redirected to checkout.stripe.com,
  // it is Hosted Checkout.

  // Attempt to fill directly. If this fails in real run, one might need detailed inspection.
  // We will assume standard IDs for now but add a fallback check or comment.

  try {
    await page.locator('#cardNumber').fill('4242424242424242');
    await page.locator('#cardExpiry').fill('1234'); // MM / YY
    await page.locator('#cardCvc').fill('123');
    await page.locator('#billingName').fill('Test User');
  } catch (e) {
    // If IDs fail, it might be due to dynamic changes in Stripe UI.
    console.warn('Stripe input filling failed, this step might require adjustment based on current Stripe UI.');
    throw e;
  }

  // Click Pay
  // The button text varies, usually "Pay" or "Subscribe"
  // Sometimes it shows the amount like "Pay €50.00"
  await page.getByRole('button', { name: /Pay/ }).click();

  // 7. Verify Confirmation
  // Should redirect back to the app's thank you page.
  await page.waitForURL(/thank-you/, { timeout: 30000 });

  // Check for confirmation message
  await expect(page.getByText('Thank you')).toBeVisible();
});
