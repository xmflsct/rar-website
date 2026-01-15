# E2E Tests

This project uses [Playwright](https://playwright.dev/) for end-to-end testing.

## Prerequisites

1.  **Environment Variables**: You must have the necessary environment variables set up to run the application (Contentful, Stripe, etc.).
2.  **Running Server**: The test assumes the application is running at `http://localhost:8788`. You can start it using `yarn dev`.
3.  **Browsers**: Ensure Playwright browsers are installed:
    ```bash
    yarn playwright install
    ```

## Running the Test

To run the end-to-end test flow:

```bash
yarn test:e2e
```

The script will:
1.  Open the application.
2.  Navigate to the `matcha-crepe` cake page.
3.  Add the cake to the bag.
4.  Proceed to checkout.
5.  Fill in the order details.
6.  Simulate a payment with Stripe.
7.  Verify the confirmation page.

## Notes

-   The test assumes a cake with slug `matcha-crepe` exists.
-   The test assumes the local server is running on port 8788. You can configure this in `playwright.config.ts`.
