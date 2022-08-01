import { ApolloClient, gql, InMemoryCache, QueryOptions } from '@apollo/client'
import { Document } from '@contentful/rich-text-types'
import { json } from '@remix-run/cloudflare'
import { DataFunctionArgs } from '@remix-run/server-runtime'

export type Context = {
  CONTENTFUL_SPACE?: string
  CONTENTFUL_KEY?: string
  STRIPE_KEY_PRIVATE?: string
  STRIPE_KEY_ADMIN?: string
}

export const apolloClient = ({
  context: { CONTENTFUL_SPACE, CONTENTFUL_KEY }
}: {
  context: Context
}) => {
  if (!CONTENTFUL_SPACE || !CONTENTFUL_KEY) {
    throw json('Missing Contentful config', { status: 500 })
  }

  return new ApolloClient({
    ssrMode: true,
    cache: new InMemoryCache(),
    uri: `https://graphql.contentful.com/content/v1/spaces/${CONTENTFUL_SPACE}/environments/master`,
    headers: {
      Authorization: `Bearer ${CONTENTFUL_KEY}`
    },
    defaultOptions: { query: { errorPolicy: 'ignore' } }
  })
}

export let cached = false
export const cacheQuery = async <T = unknown>(
  query: QueryOptions,
  ttlMinutes: number, // In minutes
  props: DataFunctionArgs
): Promise<T> => {
  const queryData = async () =>
    (await apolloClient(props).query<T>(query).catch(logError)).data

  if (!ttlMinutes) {
    return await queryData()
  }

  // @ts-ignore
  const cache = caches.default

  const cacheUrl = new URL(props.request.url)
  const cacheKey = new Request(cacheUrl.toString())

  const cacheMatch = (await cache.match(cacheKey)) as Response

  if (!cacheMatch) {
    cached = false
    const queryResponse = await queryData()
    if (!queryResponse) {
      throw json('Not Found', { status: 500 })
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

export const logError = (e: any) => {
  if (process.env.NODE_ENV === 'development') {
    e?.graphqlErrors && console.log('GraphQL', e.graphqlErrors)
    e?.clientErrors && console.log('client', e.clientErrors)
    e?.networkError && console.log('network', e.networkError.result?.errors)
  }
  throw json(null, { status: 500 })
}

export type CommonImage = {
  title: string
  description: string
  contentType: string
  url: string
}
export type CommonRichText = { json: Document; links?: any }

export type Page = {
  sys: { id: string }
  priority: number
  name: string
  slug: string
  content: CommonRichText
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
  sys: { id: string }
  image?: CommonImage
  name: string
  slug: string
  available: boolean
  highlight: boolean
  typeAAvailable?: boolean
  typeAPrice?: number
  typeAUnit?: Unit
  typeAMinimum?: number
  typeBAvailable?: boolean
  typeBPrice?: number
  typeBUnit?: Unit
  typeBMinimum?: number
  typeCAvailable?: boolean
  typeCPrice?: number
  typeCUnit?: Unit
  typeCMinimum?: number
  description?: CommonRichText
  additionalInformation?: CommonRichText
  cakeCustomizationsCollection?: {
    items: CakeCustomization[]
  }
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
}

export type Shipping = {
  year: number
  rates: {
    type: string
    countryCode: string[]
    rates: {
      weight: { min: number; max: number }
      price: number
    }[]
  }[]
}

export type MaxCalendarMonth = { month: number }

export type Unit = { unit: string }

export const CAKE_DETAILS = gql`
  fragment CakeDetails on Cake {
    sys {
      id
    }
    image {
      url
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
    typeAMinimum
    typeBAvailable
    typeBPrice
    typeBUnit {
      unit
    }
    typeBMinimum
    typeCAvailable
    typeCPrice
    typeCUnit {
      unit
    }
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
      }
    }
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
      }
      entries {
        block {
          ... on Cake {
            sys {
              id
            }
            ...CakeDetails
          }
          ... on CakesGroup {
            sys {
              id
            }
            name
            cakesCollection(limit: 10) {
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
