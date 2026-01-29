import { defineConfig, devices } from '@playwright/test'
import fs from 'fs'

if (process.env.CI) {
  const vars = [
    'CONTENTFUL_SPACE',
    'CONTENTFUL_KEY',
    'STRIPE_KEY_ADMIN',
    'STRIPE_KEY_PRIVATE',
    'WEBHOOK_STRIPE_MYPARCEL_KEY',
    'WEBHOOK_STRIPE_SIGNING_SECRET'
  ]
  let devVarsContent = ''
  for (const key of vars) {
    if (process.env[key]) {
      devVarsContent += `${key}=${process.env[key]}\n`
    }
  }
  if (devVarsContent) {
    fs.writeFileSync('.dev.vars', devVarsContent)
    console.log('Created .dev.vars from process.env for CI')
  }
}

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 5,
  reporter: 'html',
  timeout: 60000,
  expect: {
    timeout: 10000
  },
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
})
