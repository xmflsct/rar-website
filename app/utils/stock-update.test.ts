import { describe, it, expect, vi, afterEach } from 'vitest'
import { updateStockOptimized, StockItem } from './stock-update'

const mockEnv = {
  CONTENTFUL_SPACE: 'test-space',
  CONTENTFUL_PAT: 'test-pat'
}

describe('Stock Update', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('updates stocks efficiently', async () => {
    const LATENCY = 20
    const fetchMock = vi.spyOn(global, 'fetch').mockImplementation(async (url, options) => {
      await new Promise(resolve => setTimeout(resolve, LATENCY))

      if (url.toString().includes('entries')) {
        if (options?.method === 'PATCH') {
            return {
                ok: true,
                json: async () => ({})
            } as Response
        }
        // GET entry
        return {
          ok: true,
          json: async () => ({
            sys: { id: 'test-id', version: 1 },
            fields: {
              typeAStock: { 'en-GB': 100 },
              typeBStock: { 'en-GB': 100 },
              typeCStock: { 'en-GB': 100 },
            }
          })
        } as Response
      }
      return { ok: false } as Response
    })

    const items: StockItem[] = [
      { quantity: 1, metadata: { contentful_id: '1', type: 'A' } },
      { quantity: 1, metadata: { contentful_id: '2', type: 'B' } },
      { quantity: 1, metadata: { contentful_id: '1', type: 'B' } },
      { quantity: 1, metadata: { contentful_id: '3', type: 'C' } },
    ]

    await updateStockOptimized(items, mockEnv)

    expect(fetchMock).toHaveBeenCalledTimes(6)

    // Verify patch for ID 1
    const patchCallForID1 = fetchMock.mock.calls.find(call =>
        call[0].toString().endsWith('/entries/1') && call[1]?.method === 'PATCH'
    )
    expect(patchCallForID1).toBeDefined()
    const patchBody = JSON.parse(patchCallForID1![1]!.body as string)
    expect(patchBody).toHaveLength(2)
    expect(patchBody).toContainEqual({ op: 'replace', path: '/fields/typeAStock/en-GB', value: 99 })
    expect(patchBody).toContainEqual({ op: 'replace', path: '/fields/typeBStock/en-GB', value: 99 })
  })
})
