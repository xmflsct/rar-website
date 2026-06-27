import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { useEffect } from 'react'
import type { LoaderFunctionArgs, MetaFunction } from 'react-router'
import { useLoaderData, data } from 'react-router'
import { gql } from 'graphql-request'
import type { Product, WithContext } from 'schema-dts'
import CakeView from '~/components/cakeView'
import Layout from '~/layout'
import { cacheQuery, Cake, CAKE_DETAILS, DaysClosed } from '~/utils/contentful'
import { getAllPages } from '~/utils/kv'
import { SITE_NAME, absoluteUrl, cleanDescription, seoMeta } from '~/utils/seo'
import { trackViewProduct } from '~/utils/umami'

export const loader = async ({ context, params, request }: LoaderFunctionArgs) => {
  const cakeData = await cacheQuery<{
    cakeCollection: { items: Cake[] }
    daysClosedCollection: { items: DaysClosed[] }
  }>({
    ttlMinutes: 0,
    context,
    request,
    variables: { slug: params.slug, end_gte: new Date().toISOString() },
    query: gql`
      ${CAKE_DETAILS}
      query Cake($preview: Boolean, $slug: String!, $end_gte: DateTime!) {
        cakeCollection(preview: $preview, limit: 1, where: { slug: $slug }) {
          items {
            ...CakeDetails
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

  if (!cakeData?.cakeCollection?.items?.length || cakeData.cakeCollection.items.length !== 1) {
    throw data('Not Found', { status: 404 })
  }

  const { navs } = await getAllPages(context, request)
  return data({
    navs,
    cake: cakeData.cakeCollection.items[0],
    daysClosedCollection: cakeData.daysClosedCollection.items
  })
}

export const meta: MetaFunction<typeof loader> = ({ loaderData, location }) => {
  if (!loaderData?.cake) return []

  const cake = loaderData.cake
  const description = cleanDescription(
    cake.description ? documentToPlainTextString(cake.description.json) : undefined
  )
  const image = cake.image?.url || cake.imagesCollection?.items[0]?.url
  const price =
    (cake.typeCAvailable ? cake.typeCPrice : undefined) ||
    (cake.typeBAvailable ? cake.typeBPrice : undefined) ||
    (cake.typeAAvailable ? cake.typeAPrice : undefined)

  return [
    ...seoMeta({
      title: `${cake.name} | ${SITE_NAME}`,
      description,
      pathname: location.pathname,
      image
    }),
    {
      'script:ld+json': {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: cake.name,
        description,
        image: absoluteUrl(image),
        url: `https://roundandround.nl${location.pathname}`,
        offers: price
          ? {
            '@type': 'Offer',
            price,
            priceCurrency: 'EUR',
            availability: cake.available
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
            url: `https://roundandround.nl${location.pathname}`
          }
          : undefined
      } as WithContext<Product>
    }
  ]
}

const PageCake: React.FC = () => {
  const loaderData = useLoaderData<typeof loader>()
  const navs = loaderData.navs
  const cake = loaderData.cake!
  const daysClosedCollection = loaderData.daysClosedCollection

  // Track product view for Umami analytics
  useEffect(() => {
    const price =
      (cake.typeCAvailable ? cake.typeCPrice : 0) ||
      (cake.typeBAvailable ? cake.typeBPrice : 0) ||
      (cake.typeAAvailable ? cake.typeAPrice : 0) ||
      0
    trackViewProduct({
      name: cake.name,
      slug: cake.slug,
      price
    })
  }, [cake.name, cake.slug])

  return (
    <Layout
      navs={navs}
      children={<CakeView cake={cake} daysClosedCollection={daysClosedCollection} />}
    />
  )
}

export default PageCake
