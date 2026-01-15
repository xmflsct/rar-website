# E2E Tests

This project uses `agent-browser` for end-to-end testing.

## Prerequisites

1.  **Environment Variables**: You must have the necessary environment variables set up in your `.dev.vars` or `.env` file to run the application (Contentful, Stripe, etc.).
2.  **Running Server**: The test script assumes the application is running at `http://localhost:8788`. You can start it using `yarn dev`.
3.  **Browsers**: Ensure Playwright browsers are installed:
    ```bash
    npx playwright install
    ```

## Running the Test

To run the end-to-end test flow:

```bash
yarn test:e2e
```

The script will:
1.  Open the application.
2.  Navigate to a cake page.
3.  Add the cake to the bag.
4.  Proceed to checkout.
5.  Fill in the order details.
6.  Simulate a payment with Stripe.
7.  Verify the confirmation page.

## Notes

-   The test assumes a cake with slug `matcha-crepe` exists. If your content is different, please update `CAKE_SLUG` in `e2e/e2e-test.js`.
-   Stripe payment simulation relies on finding standard Stripe Checkout elements.
