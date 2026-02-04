import type { LoaderFunctionArgs } from 'react-router'
import { gql } from 'graphql-request'
import { Navigation } from '~/layout/navigation'
import { DaysClosed, graphqlRequest, Page, PAGE_CONTENT_LINKS } from './contentful'

export let kved: boolean | undefined = undefined

const getEnv = (context: LoaderFunctionArgs['context']) => (context as any)?.cloudflare?.env

const getKV = (context: LoaderFunctionArgs['context']) => {
  const env = getEnv(context)
  const preview = env?.ENVIRONMENT !== 'PRODUCTION'
  return preview ? env?.RAR_WEBSITE_PREVIEW : env?.RAR_WEBSITE as KVNamespace | undefined
}

export const getNavigation = async (
  context: LoaderFunctionArgs['context']
): Promise<{
  navs: Navigation[]
  pages: Page[]
  daysClosedCollection: DaysClosed[]
}> => {
  const KV = getKV(context)

  const request = async () =>
    await graphqlRequest<{
      pages: { items: Page[] }
      daysClosedCollection: { items: DaysClosed[] }
    }>({
      context,
      variables: { end_gte: new Date().toISOString() },
      query: gql`
        query Navigation($preview: Boolean, $end_gte: DateTime!) {
          pages: pageCollection(preview: $preview, limit: 6, order: priority_ASC) {
            items {
              sys {
                publishedAt
              }
              priority
              name
              slug
            }
          }
          daysClosedCollection(preview: $preview, where: { end_gte: $end_gte }) {
            items {
              start
              end
            }
          }
        }
      `
    })

  let data:
    | {
        pages: {
          items: Page[]
        }
        daysClosedCollection: {
          items: DaysClosed[]
        }
      }
    | null
    | undefined

  if (KV === undefined) {
    kved = false
    data = await request()
  } else {
    data = await KV.get('navigation', { type: 'json' })
    if (!data) {
      kved = false
      data = await request()
      await KV.put('navigation', JSON.stringify(data), { expirationTtl: 60 * 60 })
    } else {
      kved = true
    }
  }

  const navs = data.pages.items.map(page => ({ name: page.name, slug: page.slug }))

  return { navs, pages: data.pages.items, daysClosedCollection: data.daysClosedCollection.items }
}

export const getPage = async (
  context: LoaderFunctionArgs['context'],
  slug: string
): Promise<Page | null> => {
  const KV = getKV(context)

  const request = async () =>
    await graphqlRequest<{
      pages: { items: Page[] }
    }>({
      context,
      variables: { slug },
      query: gql`
        ${PAGE_CONTENT_LINKS}
        query Page($preview: Boolean, $slug: String!) {
          pages: pageCollection(preview: $preview, where: { slug: $slug }, limit: 1) {
            items {
              sys {
                publishedAt
              }
              priority
              name
              slug
              content {
                json
                ...PageContentLinks
              }
            }
          }
        }
      `
    })

  let page: Page | null | undefined

  if (KV === undefined) {
    const data = await request()
    page = data.pages.items[0] || null
  } else {
    page = await KV.get(`page_${slug}`, { type: 'json' })
    if (!page) {
      const data = await request()
      page = data.pages.items[0] || null
      if (page) {
        await KV.put(`page_${slug}`, JSON.stringify(page), { expirationTtl: 60 * 60 })
      }
    }
  }

  return page || null
}
