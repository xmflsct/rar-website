import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173'
const useSystemChrome = !!process.env.CI
const chromeUse = useSystemChrome ? { ['channel']: 'chrome' } : {}

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: !process.env.CI,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: process.env.CI ? 1 : 5,
  reporter: 'html',
  timeout: 180000,
  expect: {
    timeout: 10000
  },
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry'
  },
  projects: [
    {
      name: useSystemChrome ? 'chrome' : 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...chromeUse
      }
    }
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
      command: 'CHOKIDAR_USEPOLLING=true npm run dev',
      url: baseURL,
      reuseExistingServer: !process.env.CI,
      timeout: 120000
    }
})
