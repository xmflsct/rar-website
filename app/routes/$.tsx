import type { LoaderFunctionArgs, MetaFunction } from 'react-router'
import { useLoaderData, data } from 'react-router'
import RichText from '~/components/richText'
import Layout from '~/layout'
import { getNavigation, getPage } from '~/utils/kv'

export const loader = async ({ context, params }: LoaderFunctionArgs) => {
  const path = params['*']
  const { navs, daysClosedCollection } = await getNavigation(context)

  if (!path) {
    throw data('Not Found', { status: 404 })
  }

  const page = await getPage(context, path)
  if (!page) {
    throw data('Not Found', { status: 404 })
  }

  return data({ navs, page, daysClosedCollection })
}

export const meta: MetaFunction<typeof loader> = ({ data }) =>
  data?.page
    ? [
      {
        title: `${data.page.name} | Round&Round Rotterdam`
      }
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
        {page.content ? (
          <RichText content={page.content} daysClosedCollection={daysClosedCollection} />
        ) : null}
      </div>
    </Layout>
  )
}
