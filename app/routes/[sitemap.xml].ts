import { LoaderArgs } from '@remix-run/cloudflare'
import { gql } from 'graphql-request'
import { cacheQuery, Cake } from '~/utils/contentful'
import { getAllPages } from '~/utils/kv'

export const loader = async ({ context, request }: LoaderArgs) => {
  const {
    cakeCollection: { items: cakes }
  } = await cacheQuery<{
    cakeCollection: { items: Pick<Cake, 'sys' | 'slug'>[] }
  }>({
    context,
    request,
    query: gql`
      query Cake($preview: Boolean) {
        cakeCollection(preview: $preview) {
          items {
            sys {
              publishedAt
            }
            slug
          }
        }
      }
    `
  })

  const { pages } = await getAllPages(context)

  const content = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${pages.map(
        (page, index) => `
      <url>
        <loc>https://roundandround.nl/${index === 0 ? '' : `${page.slug}`}</loc>
        <lastmod>${page.sys.publishedAt}</lastmod>
        <priority>0.6</priority>
      </url>
      `
      )}
      ${cakes.map(
        cake => `
      <url>
        <loc>https://roundandround.nl/cake/${cake.slug}</loc>
        <lastmod>${cake.sys.publishedAt}</lastmod>
        <priority>0.8</priority>
      </url>
      `
      )}
    </urlset>
  `

  return new Response(content, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'xml-version': '1.0',
      encoding: 'UTF-8'
    }
  })
}
