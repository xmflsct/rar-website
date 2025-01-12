import { json, LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare'
import { Link, useLoaderData } from '@remix-run/react'
import { gql } from 'graphql-request'
import Image from '~/components/image'
import Layout from '~/layout'
import { cacheQuery, CommonImage } from '~/utils/contentful'
import { getAllPages } from '~/utils/kv'

export const loader = async ({ context, request }: LoaderFunctionArgs) => {
  const { navs } = await getAllPages(context)

  const images = await cacheQuery<{
    mooncake: CommonImage
    left: CommonImage
    right: CommonImage
  }>({
    context,
    request,
    query: gql`
      query Images($preview: Boolean) {
        mooncake: asset(preview: $preview, id: "5ZNSJ5McjyJeAYxDGWXAXm") {
          title
          description
          contentType
          url
        }
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

export const meta: MetaFunction = () => [
  {
    title: `Round&Round Rotterdam`
  }
]

export default () => {
  const { navs, images } = useLoaderData<typeof loader>()

  return (
    <Layout navs={navs}>
      <div>
        {/* <h3 className='font-bold text-lg mb-2'>Holiday Schedule</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
          <div>
            <p>
              <b>Holiday Close:</b> Dec 25 - Jan 02
            </p>
            <p>
              <b>Open again:</b> Jan 03
            </p>
            <p>Merry Christmas & Happy New Year!</p>
          </div>
        </div>
        <hr className='mt-4' /> */}

        <h2 className='text-2xl my-8'>[Our story starts from 2016]</h2>

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
