import { LoaderArgs } from '@remix-run/cloudflare'
import { gql } from 'graphql-request'
import { Navigation } from '~/layout/navigation'
import { graphqlRequest, Page, PAGE_CONTENT_LINKS } from './contentful'

const getAllPages = async (
  args: LoaderArgs
): Promise<{ navs: Navigation[]; pages: Page[] }> => {
  const kvBinding =
    args.context.ENVIRONMENT === 'PRODUCTION'
      ? args.context.RAR_WEBSITE
      : args.context.RAR_WEBSITE_PREVIEW

  let pages: Page[] | null = await kvBinding.get(`pages`, {
    type: 'json'
  })

  if (pages === null) {
    const data = await graphqlRequest<{
      pages: { items: Page[] }
    }>({
      args,
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

    await kvBinding.put(`pages`, JSON.stringify(pages), {
      expirationTtl: 60 * 60
    })
  }

  const navs = pages.map(page => ({ name: page.name, slug: page.slug }))

  return { navs, pages }
}

export { getAllPages }
