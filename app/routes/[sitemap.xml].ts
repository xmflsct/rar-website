import type { LoaderFunctionArgs } from 'react-router'
import { gql } from 'graphql-request'
import { cacheQuery, Cake } from '~/utils/contentful'
import { getAllPages } from '~/utils/kv'
import { SITE_URL } from '~/utils/seo'

const xml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
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

  const { pages } = await getAllPages(context, request)

  const pageUrls = pages.filter(page => page.slug)

  const content = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${SITE_URL}</loc>
        <lastmod>${xml(pages[0]?.sys.publishedAt || new Date().toISOString())}</lastmod>
        <priority>0.8</priority>
      </url>
      ${pageUrls.map(
    page => `
          <url>
            <loc>${SITE_URL}/${xml(page.slug)}</loc>
            <lastmod>${xml(page.sys.publishedAt)}</lastmod>
            <priority>0.6</priority>
          </url>
        `
  )}
      ${cakes.map(
    cake => `
      <url>
        <loc>${SITE_URL}/cake/${xml(cake.slug)}</loc>
        <lastmod>${xml(cake.sys.publishedAt)}</lastmod>
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
