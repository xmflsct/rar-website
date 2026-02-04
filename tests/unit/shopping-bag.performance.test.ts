import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mocks must be defined before imports
const requestSpy = vi.fn();

vi.mock('graphql-request', () => {
  return {
    gql: (strings: any) => strings,
    GraphQLClient: vi.fn(function() {
      return {
        request: requestSpy
      }
    })
  };
});

vi.mock('../../app/utils/kv', () => ({
  getAllPages: vi.fn().mockResolvedValue({
    navs: [],
    pages: [],
    daysClosedCollection: []
  })
}));

const cacheStore = new Map();
const mockCache = {
  match: vi.fn(async (req) => {
    const key = req.url;
    return cacheStore.get(key);
  }),
  put: vi.fn(async (req, res) => {
    const key = req.url;
    // We must clone because the response body can be read only once
    // But for this mock we just store it.
    // In real Cloudflare environment, we need to be careful, but here it's a mock.
    cacheStore.set(key, res);
    return Promise.resolve();
  })
};

vi.stubGlobal('caches', { default: mockCache });

// Import loader after mocks
import { loader } from '../../app/routes/shopping-bag';

describe('Shopping Bag Performance', () => {
  beforeEach(() => {
    cacheStore.clear();
    requestSpy.mockClear();
    requestSpy.mockResolvedValue({
        shippingCollection: { items: [{ rates: [] }] },
        maxCalendarMonthCollection: { items: [{ month: 1 }] },
        daysClosedCollection: { items: [] }
    });
  });

  it('measures graphql requests count', async () => {
    const request = new Request('http://localhost/shopping-bag');
    const context = {
      cloudflare: {
        env: {
          ENVIRONMENT: 'PRODUCTION',
          CONTENTFUL_SPACE: 'test-space',
          CONTENTFUL_KEY: 'test-key'
        }
      }
    };

    // First call
    await loader({ request: request.clone() as any, context: context as any, params: {} } as any);

    // Second call
    await loader({ request: request.clone() as any, context: context as any, params: {} } as any);

    console.log(`[MEASURE] GraphQL Requests: ${requestSpy.mock.calls.length}`);

    // Expectation for UNOPTIMIZED code: 2 requests
    expect(requestSpy.mock.calls.length).toBe(1);
  });
});
