import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['app/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['app/routes/admin.orders.tsx'],
      reporter: ['text', 'json-summary'],
      thresholds: {
        statements: 95,
        branches: 90,
        functions: 100,
        lines: 95,
      },
    },
  },
})
