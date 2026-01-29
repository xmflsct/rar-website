import { Document } from '@contentful/rich-text-types'
import type { LoaderFunctionArgs } from 'react-router'
import { data } from 'react-router'
import { gql, GraphQLClient, RequestDocument, Variables } from 'graphql-request'

declare global {
  interface CacheStorage {
    default: Cache
  }
}

type GraphQLRequest = {
  context: LoaderFunctionArgs['context']
  query: RequestDocument
  variables?: Variables
}

const getEnv = (context: LoaderFunctionArgs['context']) => (context as any)?.cloudflare?.env

export let cached: boolean | undefined = undefined

export const graphqlRequest = async <T = unknown>({
  context,
  query,
  variables
}: GraphQLRequest) => {
  const env = getEnv(context)
  if (!env?.CONTENTFUL_SPACE || !env.CONTENTFUL_KEY) {
    throw data('Missing Contentful config', { status: 500 })
  }

  const preview = env.ENVIRONMENT !== 'PRODUCTION'

  return new GraphQLClient(
    `https://graphql.contentful.com/content/v1/spaces/${env.CONTENTFUL_SPACE}/environments/master`,
    {
      fetch,
      headers: { Authorization: `Bearer ${env.CONTENTFUL_KEY}` },
      errorPolicy: 'ignore'
    }
  ).request<T>(query, { ...variables, preview })
}
export const cacheQuery = async <T = unknown>({
  ttlMinutes = 15,
  ...rest
}: GraphQLRequest & { request: Request; ttlMinutes?: number }): Promise<T> => {
  const queryData = async () => await graphqlRequest<T>(rest)

  const env = getEnv(rest.context)
  const preview = env?.ENVIRONMENT !== 'PRODUCTION'
  if (!ttlMinutes || preview) {
    return await queryData()
  }

  const cache = caches.default

  const cacheUrl = new URL(rest.request.url)
  const cacheKey = new Request(cacheUrl.toString())

  const cacheMatch = (await cache.match(cacheKey)) as Response

  if (!cacheMatch) {
    cached = false
    const queryResponse = await queryData()
    if (!queryResponse) {
      throw data('Not Found', { status: 500 })
    }
    const cacheResponse = new Response(JSON.stringify(queryResponse), {
      headers: { 'Cache-Control': `s-maxage=${ttlMinutes * 60}` }
    })
    cache.put(cacheKey, cacheResponse)
    return queryResponse
  } else {
    cached = true
    return await cacheMatch.json()
  }
}

export type CommonImage = {
  title: string
  description: string
  contentType: string
  url: string
}
export type CommonRichText = { json: Document; links?: any }

export type Page = {
  sys: { publishedAt: string }
  priority: number
  name: string
  slug: string
  content: CommonRichText
}

export type InternalAssetsGrid = {
  sys: { id: string }
  columnsLarge?: 1 | 2 | 3 | 4 | 5 | 6
  columnsMedium?: 1 | 2 | 3 | 4 | 5 | 6
  columnsSmall?: 1 | 2 | 3 | 4 | 5 | 6
  assetsCollection?: {
    items: CommonImage[]
  }
}

export type CakesGroup = {
  sys: { id: string }
  name?: string
  description?: CommonRichText
  cakesCollection?: {
    items: Cake[]
  }
}

export type Cake = {
  sys: { id: string; publishedAt: string }
  image?: CommonImage
  imagesCollection: {
    items: (CommonImage | undefined)[]
  }
  name: string
  slug: string
  available: boolean
  highlight: boolean
  typeAAvailable?: boolean
  typeAPrice?: number
  typeAUnit?: Unit
  typeAStock?: number
  typeAMinimum?: number
  typeBAvailable?: boolean
  typeBPrice?: number
  typeBUnit?: Unit
  typeBStock?: number
  typeBMinimum?: number
  typeCAvailable?: boolean
  typeCPrice?: number
  typeCUnit?: Unit
  typeCStock?: number
  typeCMinimum?: number
  description?: CommonRichText
  additionalInformation?: CommonRichText
  cakeCustomizationsCollection?: {
    items: (CakeCustomization | null)[]
  }
  pickupNotAvailableStart?: string // Date
  pickupNotAvailableEnd?: string // Date
  deliveryCustomizations?: {
    pickup?: { minimum?: number; availability: DeliveryCustomization }
    shipping?: {
      minimum?: number
      freeAbove?: number
      availability: DeliveryCustomization
    }
  }
  shippingWeight?: number
  shippingAvailable?: boolean
}
export type DeliveryCustomization =
  | { after: string; before: string }
  | { date: string; before?: string }[]

export type CakeCustomization = {
  type: string
  options: string[]
  customAllow?: boolean
  customMaxLength?: number // Default to 30
}

export type Shipping = {
  year: number
  rates: {
    type: string
    countries: { code: string; name: string }[]
    rates: {
      weight: { min: number; max: number }
      price: number
      freeAbove?: number
      label?: boolean
    }[]
  }[]
}

export type MaxCalendarMonth = { month: number }
export type DaysClosed = { start: string; end: string }

export type Unit = { unit: string }

export const CAKE_DETAILS = gql`
  fragment CakeDetails on Cake {
    sys {
      id
    }
    image {
      url
    }
    imagesCollection {
      items {
        url
      }
    }
    name
    slug
    available
    highlight
    typeAAvailable
    typeAPrice
    typeAUnit {
      unit
    }
    typeAStock
    typeAMinimum
    typeBAvailable
    typeBPrice
    typeBUnit {
      unit
    }
    typeBStock
    typeBMinimum
    typeCAvailable
    typeCPrice
    typeCUnit {
      unit
    }
    typeCStock
    typeCMinimum
    description {
      json
    }
    additionalInformation {
      json
    }
    cakeCustomizationsCollection(limit: 10) {
      items {
        type
        options
        customAllow
        customMaxLength
      }
    }
    pickupNotAvailableStart
    pickupNotAvailableEnd
    deliveryCustomizations
    shippingWeight
    shippingAvailable
  }
`
export const PAGE_CONTENT_LINKS = gql`
  ${CAKE_DETAILS}
  fragment PageContentLinks on PageContent {
    links {
      assets {
        block {
          sys {
            id
          }
          url
        }
        hyperlink {
          sys {
            id
          }
          url
        }
      }
      entries {
        block {
          ... on InternalAssetsGrid {
            __typename
            sys {
              id
            }
            columnsLarge
            columnsMedium
            columnsSmall
            assetsCollection(limit: 20) {
              items {
                url
              }
            }
          }
          ... on Cake {
            __typename
            sys {
              id
            }
            ...CakeDetails
          }
          ... on CakesGroup {
            __typename
            sys {
              id
            }
            name
            description {
              json
            }
            cakesCollection(limit: 20) {
              items {
                ...CakeDetails
              }
            }
          }
        }
      }
    }
  }
`
