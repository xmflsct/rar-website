# E2E Tests

This project uses [Playwright](https://playwright.dev/) for end-to-end testing.

## Prerequisites

1.  **Environment Variables**: The test runs with mocked environment variables (`MOCK_CONTENTFUL=true`).
2.  **Browsers**: Ensure Playwright browsers are installed:
    ```bash
    yarn playwright install
    ```

## Running the Test

To run the end-to-end test flow:

```bash
yarn test:e2e
```

The script will:
1.  Open the application (automatically started by Playwright).
2.  Navigate to the `matcha-crepe` cake page.
3.  Add the cake to the bag.
4.  Proceed to checkout.
5.  Fill in the order details.
6.  Simulate a payment via Stripe redirection.
7.  Verify the redirection to Stripe.

## Notes

-   The test assumes a cake with slug `matcha-crepe` exists (mocked).
-   The test assumes the local server runs on port 5173.
-   **Confirmation Page**: The test flow stops at the Stripe redirection. We mock the server-side Stripe session verification by intercepting the checkout POST request, but simulating a full return to the confirmation page (`/thank-you/:session_id`) requires valid Stripe API interactions which are mocked at the network level but complex to fully simulate without a real backend session.
