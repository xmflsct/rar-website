import { json, LoaderArgs, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import RichText from '~/components/richText'
import Layout from '~/layout'
import { getAllPages } from '~/utils/kv'

export const loader = async (args: LoaderArgs) => {
  const { navs, pages } = await getAllPages(args)

  return json({ navs, page: pages[0] })
}

export const meta: MetaFunction = () => ({
  title: `Round&Round Rotterdam`
})

export default () => {
  const { navs, page } = useLoaderData<typeof loader>()

  return (
    <Layout navs={navs}>
      <div>
        <h1 className='text-3xl mx-auto max-w-2xl mb-4'>{page.name}</h1>
        <RichText content={page.content} />
      </div>
    </Layout>
  )
}
