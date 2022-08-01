import { gql } from '@apollo/client'
import { DataFunctionArgs } from '@remix-run/cloudflare'
import { Navigation } from '~/layout/navigation'
import { apolloClient, logError, Page, PAGE_CONTENT_LINKS } from './contentful'

const getAllPages = async (
  props: DataFunctionArgs
): Promise<{ navs: Navigation[]; pages: Page[] }> => {
  const kvBinding =
    props.context.ENVIRONMENT === 'PRODUCTION'
      ? props.context.RAR_WEBSITE
      : props.context.RAR_WEBSITE_PREVIEW

  let pages: Page[] | null = await kvBinding.get(`pages`, {
    type: 'json'
  })

  if (pages === null) {
    const { data } = await apolloClient(props)
      .query<{ pages: { items: Page[] } }>({
        query: gql`
          ${PAGE_CONTENT_LINKS}
          query Pages {
            pages: pageCollection(limit: 8, order: priority_ASC) {
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
      .catch(logError)
    pages = data.pages.items

    await kvBinding.put(`pages`, JSON.stringify(pages), {
      expirationTtl: 60 * 60
    })
  }

  const navs = pages.map(page => ({ name: page.name, slug: page.slug }))

  return { navs, pages }
}

export { getAllPages }
