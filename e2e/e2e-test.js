const { execSync } = require('child_process');

const BASE_URL = process.env.BASE_URL || "http://localhost:8788";
const SESSION = "e2e-test-session";
process.env.AGENT_BROWSER_SESSION = SESSION;

const ab = (cmd) => {
  const fullCmd = `./node_modules/.bin/agent-browser ${cmd}`;
  console.log(`Running: ${fullCmd}`);
  try {
    return execSync(fullCmd, { encoding: 'utf-8', stdio: 'pipe' });
  } catch (error) {
    if (error.status !== 0) {
      console.error(`Command failed with status ${error.status}: ${error.stderr}`);
    }
    throw error;
  }
};

const run = () => {
  console.log("Starting E2E test...");

  // 1. Open the homepage
  console.log("Opening homepage...");
  ab(`open "${BASE_URL}"`);

  // 2. Navigate to a cake page.
  // We'll try to find a link to a cake in the navs or guess a slug.
  // Assuming 'matcha-crepe' exists as a common item, or we can try to find a link from the page.
  // For robustness, we will try to extract links.

  // Note: parsing `ab snapshot --json` would be ideal but for simplicity we will assume a known slug or 'cakes' page.
  // Let's assume we can go to a product page.
  const CAKE_SLUG = "matcha-crepe";
  console.log(`Navigating to cake page: ${CAKE_SLUG}`);
  ab(`open "${BASE_URL}/cake/${CAKE_SLUG}"`);

  // 3. Add to bag
  console.log("Adding to bag...");
  // We need to handle options.
  // 'CakeOrder' component has Amount and Type (A, B, C) and maybe Delivery options.
  // Defaults:
  // - Amount: select first available option?
  // - Unit: select first available (useEffect sets it).
  // - Delivery: if 'shippingAvailable', we might need to select it.

  // Let's try to select Amount = 1 if not selected.
  // 'select[name="amount"]' -> '1'
  try {
      ab(`select "select[name='amount']" "1"`);
  } catch (e) {
      console.log("Could not select amount (maybe already selected or different input)");
  }

  // Click Add to bag
  ab(`click "text=Add to bag"`);

  // 4. Go to Shopping Bag
  console.log("Going to Shopping Bag...");
  ab(`open "${BASE_URL}/shopping-bag"`);

  // 5. Fill out the form
  console.log("Filling out checkout form...");

  // Handle Pickup Date if visible
  // The 'PickDay' component uses a hidden input or complex UI.
  // If we can find 'input[name="pickup_date"]', we might need to set it.
  // But usually it's set by clicking a day.
  // Let's assume for this test we picked a cake that doesn't strictly require date or defaults are fine,
  // OR we try to click a day.
  // ab click ".rdp-day:not(.rdp-day_disabled)" // Click first available day?

  // Handle Country for Shipping if visible
  try {
      // Check if country select is visible.
      // We can't easily check visibility without 'is visible' which returns exit code.
      // We'll blindly try to select NL
      ab(`select "select[name='countryCode']" "NL"`);
  } catch (e) {
      console.log("Country select not found or not needed.");
  }

  // Check Terms
  console.log("Accepting terms...");
  ab(`check "input[name='terms']"`);

  // 6. Submit checkout
  console.log("Submitting checkout...");
  ab(`click "button[type='submit']"`);

  // 7. Payment (Stripe)
  console.log("Waiting for Stripe...");

  // Wait for Stripe Checkout to load.
  // It usually has an email input.
  ab(`wait "input[id='email']"`);

  console.log("Filling Stripe details...");
  ab(`fill "input[id='email']" "test@example.com"`);
  ab(`fill "input[id='cardNumber']" "4242424242424242"`);
  ab(`fill "input[id='cardExpiry']" "1234"`); // MMYY
  ab(`fill "input[id='cardCvc']" "123"`);
  ab(`fill "input[id='billingName']" "Test User"`);

  console.log("Submitting Payment...");
  ab(`click "button[type='submit']"`); // Or whatever the pay button is

  // 8. Verify Confirmation
  console.log("Verifying confirmation...");
  // Wait for redirect back to thank-you
  // Note: 'wait url' syntax might depend on agent-browser version or if it supports it.
  // If not, we can wait for text "Thank you" or similar.
  ab(`wait "text=Thank you"`);

  console.log("Test completed successfully.");
};

run();
