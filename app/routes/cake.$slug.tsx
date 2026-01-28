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

  const { navs } = await getAllPages(context)
  return data({
    navs,
    cake: cakeData.cakeCollection.items[0],
    daysClosedCollection: cakeData.daysClosedCollection.items
  })
}

export const meta: MetaFunction<typeof loader> = ({ data: loaderData }) =>
  loaderData?.cake
    ? [
      {
        title: `${loaderData.cake.name} | Round&Round Rotterdam`
      },
      {
        property: 'og:title',
        content: loaderData.cake.name
      },
      loaderData.cake.description
        ? {
          name: 'description',
          content: documentToPlainTextString(loaderData.cake.description.json).substring(0, 199)
        }
        : {},
      {
        'script:ld+json': {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: loaderData.cake.name,
          image: loaderData.cake.image?.url || loaderData.cake.imagesCollection?.items[0]?.url,
          offers: {
            '@type': 'Offer',
            price:
              (loaderData.cake.typeCAvailable ? loaderData.cake.typeCPrice : 0) ||
              (loaderData.cake.typeBAvailable ? loaderData.cake.typeBPrice : 0) ||
              (loaderData.cake.typeAAvailable ? loaderData.cake.typeAPrice : 0),
            priceCurrency: 'EUR'
          }
        } as WithContext<Product>
      }
    ]
    : []

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
