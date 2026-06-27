import type { LoaderFunctionArgs, MetaFunction } from 'react-router'
import { useLoaderData, data } from 'react-router'
import RichText from '~/components/richText'
import Layout from '~/layout'
import { getAllPages } from '~/utils/kv'
import { documentToPlainTextString } from '@contentful/rich-text-plain-text-renderer'
import { SITE_NAME, seoMeta } from '~/utils/seo'

export const loader = async ({ context, params, request }: LoaderFunctionArgs) => {
  const path = params['*']
  const { navs, pages, daysClosedCollection } = await getAllPages(context, request)

  const matchedPages = pages.filter(page => page.slug === path)
  if (!matchedPages.length) {
    throw data('Not Found', { status: 404 })
  }

  return data({ navs, page: matchedPages[0], daysClosedCollection })
}

export const meta: MetaFunction<typeof loader> = ({ loaderData, location }) =>
  loaderData?.page
    ? [
      ...seoMeta({
        title: `${loaderData.page.name} | ${SITE_NAME}`,
        description: documentToPlainTextString(loaderData.page.content.json),
        pathname: location.pathname
      })
    ]
    : []

export default () => {
  const loaderData = useLoaderData<typeof loader>()
  const navs = loaderData.navs
  const page = loaderData.page!
  const daysClosedCollection = loaderData.daysClosedCollection

  return (
    <Layout navs={navs}>
      <div>
        <h1 className='text-3xl mx-auto max-w-2xl mb-4'>{page.name}</h1>
        <RichText content={page.content} daysClosedCollection={daysClosedCollection} />
      </div>
    </Layout>
  )
}
