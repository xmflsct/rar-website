import type { LoaderFunctionArgs } from 'react-router'
import { data as routeData } from 'react-router'
import { gql } from 'graphql-request'
import { Navigation } from '~/layout/navigation'
import { getCloudflareContext } from './cloudflare'
import { DaysClosed, graphqlRequest, isPreviewRequest, Page, PAGE_CONTENT_LINKS } from './contentful'

export let kved: boolean | undefined = undefined

const getEnv = (context: LoaderFunctionArgs['context']) => getCloudflareContext(context)?.env

const getAllPages = async (
  context: LoaderFunctionArgs['context'],
  request?: Request
): Promise<{
  navs: Navigation[]
  pages: Page[]
  daysClosedCollection: DaysClosed[]
}> => {
  const env = getEnv(context)
  const preview = isPreviewRequest(request)

  const fetchPages = async () =>
    await graphqlRequest<{
      pages: { items: Page[] }
      daysClosedCollection: { items: DaysClosed[] }
    }>({
      context,
      request,
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

  const KV = (preview ? env?.RAR_WEBSITE_PREVIEW : env?.RAR_WEBSITE) as KVNamespace | undefined
  if (preview && !KV) {
    throw routeData('Missing RAR_WEBSITE_PREVIEW', { status: 500 })
  }
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
    data = await fetchPages()
  } else {
    data = await KV.get(`data`, { type: 'json' })
    if (!data) {
      kved = false
      data = await fetchPages()

      await KV.put(`data`, JSON.stringify(data), { expirationTtl: 60 * 60 })
    } else {
      kved = true
    }
  }

  const navs = data.pages.items.map(page => ({ name: page.name, slug: page.slug }))

  return { navs, pages: data.pages.items, daysClosedCollection: data.daysClosedCollection.items }
}

export { getAllPages }
