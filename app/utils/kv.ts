import { LoaderFunctionArgs } from '@remix-run/cloudflare'
import { gql } from 'graphql-request'
import { Navigation } from '~/layout/navigation'
import { DaysClosed, graphqlRequest, Page, PAGE_CONTENT_LINKS } from './contentful'

export let kved: boolean | undefined = undefined

const getAllPages = async (
  context: LoaderFunctionArgs['context']
): Promise<{
  navs: Navigation[]
  pages: Page[]
  daysClosedCollection: DaysClosed[]
}> => {
  const preview = context?.ENVIRONMENT !== 'PRODUCTION'

  const request = async () =>
    await graphqlRequest<{
      pages: { items: Page[] }
      daysClosedCollection: { items: DaysClosed[] }
    }>({
      context,
      variables: { end_gte: new Date().toISOString() },
      query: gql`
        ${PAGE_CONTENT_LINKS}
        query Pages($preview: Boolean, $end_gte: DateTime!) {
          pages: pageCollection(preview: $preview, limit: 6, order: priority_ASC) {
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
          daysClosedCollection(preview: $preview, where: { end_gte: $end_gte }) {
            items {
              start
              end
            }
          }
        }
      `
    })

  const KV = context?.RAR_WEBSITE as KVNamespace | undefined
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

  if (KV === undefined || preview) {
    kved = false
    data = await request()
  } else {
    data = await KV.get(`data`, { type: 'json' })
    if (!data) {
      kved = false
      data = await request()

      await KV.put(`data`, JSON.stringify(data), { expirationTtl: 60 * 60 })
    } else {
      kved = true
    }
  }

  const navs = data.pages.items.map(page => ({ name: page.name, slug: page.slug }))

  return { navs, pages: data.pages.items, daysClosedCollection: data.daysClosedCollection.items }
}

export { getAllPages }
