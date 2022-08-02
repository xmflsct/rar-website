import { gql } from 'graphql-request'
import { Navigation } from '~/layout/navigation'
import { Context } from '~/root'
import { graphqlRequest, Page, PAGE_CONTENT_LINKS } from './contentful'

export let kved: boolean | undefined = undefined

const getAllPages = async (
  context: Context
): Promise<{
  navs: Navigation[]
  pages: Page[]
}> => {
  const request = async () =>
    (
      await graphqlRequest<{
        pages: { items: Page[] }
      }>({
        context,
        query: gql`
          ${PAGE_CONTENT_LINKS}
          query Pages($preview: Boolean) {
            pages: pageCollection(
              preview: $preview
              limit: 8
              order: priority_ASC
            ) {
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
    ).pages.items

  const KV = context.RAR_WEBSITE
  let pages: Page[] | null | undefined = await KV?.get(`pages`, {
    type: 'json'
  })

  if (KV === undefined) {
    kved = false
    pages = await request()
  } else {
    if (!pages) {
      kved = false
      pages = await request()

      await KV.put(`pages`, JSON.stringify(pages), { expirationTtl: 60 * 60 })
    } else {
      kved = true
    }
  }

  const navs = pages.map(page => ({ name: page.name, slug: page.slug }))

  return { navs, pages }
}

export { getAllPages }
