import { json, LoaderArgs, MetaFunction } from '@remix-run/cloudflare'
import { useLoaderData } from '@remix-run/react'
import { gql } from 'graphql-request'
import Image from '~/components/image'
import Layout from '~/layout'
import { cacheQuery, CommonImage } from '~/utils/contentful'
import { getAllPages } from '~/utils/kv'

export const loader = async ({ context, request }: LoaderArgs) => {
  const { navs } = await getAllPages(context)

  const images = await cacheQuery<{
    left: CommonImage
    right: CommonImage
  }>({
    context,
    request,
    query: gql`
      query Images($preview: Boolean) {
        left: asset(preview: $preview, id: "61lqEfYQpWFMG7JHYZr8qP") {
          title
          description
          contentType
          url
        }
        right: asset(preview: $preview, id: "6xqZvlKCpGsv0HLVcFLRuC") {
          title
          description
          contentType
          url
        }
      }
    `
  })

  return json({ navs, images })
}

export const meta: MetaFunction = () => ({
  title: `Round&Round Rotterdam`
})

export default () => {
  const { navs, images } = useLoaderData<typeof loader>()

  return (
    <Layout navs={navs}>
      <div>
        <h2 className='text-2xl mb-8'>[Shop Holiday]</h2>
        <div>
          <p>Dear everyone,</p>
          <p>December 24th will be the last day we open in 2022.<br />Round & Round will be open only for order pick-up.<br />Matcha Next Door will be open normally from 12:00- 18:00 :)</p>
          <p>From December 25th - January 03 both spaces will be closed. We will be back on January 4th Wednesday.</p>
          <p>Merry Christmas & Happy New Year!</p>
          <p>Love,<br />Team R&R</p>
        </div>

        <h2 className='text-2xl mb-8'>[Our story starts from 2016]</h2>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          <div>
            <h3 className='font-bold text-xl'>Round & Round</h3>
            <p className='text-lg mb-2'>Cross cultural cakes and sweets</p>
            <Image width={440} image={images.left} />
          </div>
          <div>
            <h3 className='font-bold text-xl'>Matcha Next Door</h3>
            <p className='text-lg mb-2'>Japanese tea room</p>
            <Image width={440} image={images.right} />
          </div>

          <div>
            <h4 className='font-bold'>Opening hours</h4>
            <p>Wed - Sun</p>
            <p>12:00 - 18:00</p>
            <p>[Digital Pay Only]</p>
          </div>
          <div>
            <h4 className='font-bold'>Contact</h4>
            <p>info@roundandround.nl</p>
            <p>010 7856545</p>
          </div>

          <div>
            <h4 className='font-bold'>Round & Round</h4>
            <p>
              Hoogstraat 55A
              <br />
              3011 PG Rotterdam
            </p>
          </div>
          <div>
            <h4 className='font-bold'>Matcha Next Door</h4>
            <p>
              Hoogstraat 57A
              <br />
              3011 PG Rotterdam
            </p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
