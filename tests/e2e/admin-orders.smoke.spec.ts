import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { openAdminOrders } from './fixtures'

const sessionFile = process.env.ADMIN_ORDERS_SESSION_FILE
const since = process.env.ADMIN_ORDERS_SMOKE_SINCE

test('loads all 30 generated orders across real Stripe pages', async ({ page, baseURL }) => {
  test.skip(!sessionFile || !since, 'Run through the manual admin-orders smoke workflow')

  const expectedIds = readFileSync(sessionFile!, 'utf8').trim().split('\n')
  expect(expectedIds).toHaveLength(30)
  expect(new Set(expectedIds).size).toBe(expectedIds.length)

  await openAdminOrders(
    page,
    baseURL,
    new URLSearchParams({
      since: since!,
      until: Math.floor(Date.now() / 1000).toString()
    })
  )

  const rows = page.locator('tbody tr[data-order-id]')
  await expect(rows).toHaveCount(25)
  const initialIds = await rows.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute('data-order-id'))
  )

  const loadMore = page.getByRole('button', { name: 'Load more', exact: true })
  // ponytail: 10 pages caps this smoke at 250 orders; raise it if a manual run grows past that.
  for (let pageNumber = 0; pageNumber < 10 && (await loadMore.isVisible()); pageNumber++) {
    const previousCount = await rows.count()
    await loadMore.click()
    await expect.poll(() => rows.count()).toBeGreaterThan(previousCount)
  }
  await expect(page.getByText('The end', { exact: true })).toBeVisible()

  const loadedIds = await rows.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute('data-order-id'))
  )
  expect(new Set(loadedIds).size).toBe(loadedIds.length)
  expect(initialIds.every((id) => loadedIds.includes(id))).toBe(true)
  expect(expectedIds.every((id) => loadedIds.includes(id))).toBe(true)
})
