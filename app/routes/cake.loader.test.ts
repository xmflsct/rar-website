// @ts-nocheck
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { loader } from './cake.$slug'
import { getAllPages } from '~/utils/kv'

// Mock getAllPages to avoid unrelated fetches
vi.mock('~/utils/kv', () => ({
  getAllPages: vi.fn()
}))

describe('cake.$slug loader', () => {
  let cacheStore: Map<string, Response>
  let fetchMock: any

  beforeEach(() => {
    vi.resetAllMocks()

    // Mock KV response
    ;(getAllPages as any).mockResolvedValue({
      navs: [],
      pages: [],
      daysClosedCollection: []
    })

    // Mock Cache
    cacheStore = new Map()
    const cacheMock = {
      match: vi.fn(async (request: Request) => {
        const key = request.url
        const cachedRes = cacheStore.get(key)
        if (cachedRes) {
            return cachedRes.clone()
        }
        return undefined
      }),
      put: vi.fn(async (request: Request, response: Response) => {
        const key = request.url
        cacheStore.set(key, response.clone())
      })
    }
    // @ts-ignore
    global.caches = { default: cacheMock }

    // Mock Fetch
    fetchMock = vi.fn(async () => {
      return new Response(JSON.stringify({
        data: {
          cakeCollection: {
            items: [{
              name: 'Test Cake',
              slug: 'test-cake',
              imagesCollection: { items: [] },
              description: { json: {} },
              cakeCustomizationsCollection: { items: [] }
            }]
          },
          daysClosedCollection: { items: [] }
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      })
    })
    global.fetch = fetchMock
    // Ensure Request/Response are available (Node env usually needs polyfill or they are global in newer Node)
    // In Vitest with happy-dom/jsdom they are present, but with node env they might need attention.
    // Vitest usually patches them if using 'happy-dom' or 'jsdom' environment.
    // If running in 'node' environment, we rely on Node 18+ globals.
  })

  afterEach(() => {
    vi.restoreAllMocks()
    // @ts-ignore
    delete global.caches
  })

  it('should fetch data once when cache is enabled (ttlMinutes: 60)', async () => {
    const context = {
      cloudflare: {
        env: {
          CONTENTFUL_SPACE: 'test',
          CONTENTFUL_KEY: 'test',
          ENVIRONMENT: 'PRODUCTION'
        }
      }
    }
    const params = { slug: 'test-cake' }
    const request = new Request('http://localhost/cake/test-cake')

    // First call
    await loader({ context, params, request } as any)

    // Second call
    await loader({ context, params, request } as any)

    // Should call fetch twice because ttlMinutes is 0 in the source code
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
