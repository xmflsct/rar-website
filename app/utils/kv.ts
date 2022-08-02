import { json } from '@remix-run/cloudflare'
import { gql } from 'graphql-request'
import { Navigation } from '~/layout/navigation'
import { context } from '~/root'
import { graphqlRequest, Page, PAGE_CONTENT_LINKS } from './contentful'

const getAllPages = async (): Promise<{
  navs: Navigation[]
  pages: Page[]
}> => {
  const KV =
    context.ENVIRONMENT === 'PRODUCTION'
      ? context.RAR_WEBSITE
      : context.ENVIRONMENT === 'PREVIEW'
      ? context.RAR_WEBSITE_PREVIEW
      : undefined
  if (!KV) throw json('KV binding missing', { status: 500 })

  let pages: Page[] | null = await KV.get(`pages`, {
    type: 'json'
  })

  if (pages === null) {
    const data = await graphqlRequest<{
      pages: { items: Page[] }
    }>({
      query: gql`
        ${PAGE_CONTENT_LINKS}
        query Pages($preview: Boolean) {
          pages: pageCollection(
            preview: $preview
            limit: 8
            order: priority_ASC
          ) {
            items {
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
    pages = data.pages.items

    await KV.put(`pages`, JSON.stringify(pages), { expirationTtl: 60 * 60 })
  }

  const navs = pages.map(page => ({ name: page.name, slug: page.slug }))

  return { navs, pages }
}

export { getAllPages }
