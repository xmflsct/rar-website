import {
  documentToReactComponents,
  Options
} from '@contentful/rich-text-react-renderer'
import { BLOCKS, INLINES, Text } from '@contentful/rich-text-types'
import { Link } from '@remix-run/react'
import classNames from 'classnames'
import {
  Cake,
  CakesGroup,
  CommonImage,
  CommonRichText
} from '~/utils/contentful'
import { full } from '~/utils/currency'
import CakeView from './cakeView'
import Image from './image'

const richTextOptions = ({
  links,
  assetWidth
}: {
  links: any
  assetWidth?: number
}): Options => {
  const assetMap = new Map()
  if (links?.assets?.block) {
    for (const asset of links.assets.block) {
      assetMap.set(asset.sys.id, asset)
    }
  }

  const entryMap = new Map()
  if (links?.entries?.block) {
    for (const entry of links.entries?.block) {
      entryMap.set(entry.sys.id, entry)
    }
  }

  return {
    renderNode: {
      [BLOCKS.EMBEDDED_ASSET]: node => {
        const asset = assetMap.get(node.data.target.sys.id) as CommonImage
        if (!asset) return

        return (
          <figure>
            <Image
              alt={asset.title}
              image={asset}
              width={assetWidth || 432}
              quality={85}
              className={classNames(asset.description ? 'mb-0' : '', 'mx-auto')}
            />
            {asset.description && (
              <figcaption className='mt-1'>{asset.description}</figcaption>
            )}
          </figure>
        )
      },
      [BLOCKS.EMBEDDED_ENTRY]: node => {
        const entry = entryMap.get(node.data.target.sys.id)
        if (!entry) return null

        switch (entry.__typename) {
          case 'Cake':
            const cake = entry as Cake
            return (
              <div
                className='not-prose border-t border-b py-4'
                children={<CakeView cake={cake} />}
              />
            )
          case 'CakesGroup':
            const cakesGroup = entry as CakesGroup
            return (
              <div className='not-prose mb-4'>
                <h2 className='text-2xl my-4'>{entry.name}</h2>
                <RichText content={cakesGroup.description} />
                <div className='grid grid-cols-2 lg:grid-cols-3 gap-4'>
                  {cakesGroup.cakesCollection?.items?.map(cake => {
                    const typePrice = (type: 'A' | 'B' | 'C') => {
                      if (!cake[`type${type}Available`]) return
                      if (cake[`type${type}Price`] && cake[`type${type}Unit`]) {
                        return (
                          <li>
                            {full(cake[`type${type}Price`]!)} /{' '}
                            {cake[`type${type}Unit`]!.unit}
                          </li>
                        )
                      }
                    }
                    return (
                      <Link
                        key={cake.sys.id}
                        to={`/cake/${cake.slug}`}
                        className='group'
                      >
                        <Image
                          alt={cake.name}
                          image={cake.image}
                          width={288}
                          height={288}
                          behaviour='fill'
                          className='group-hover:opacity-50'
                        />
                        {cake.available ? (
                          <p className='my-1 font-bold underline-offset-4 group-hover:underline'>
                            {cake.name}
                          </p>
                        ) : (
                          <p className='my-1 font-bold underline-offset-4 group-hover:underline line-through'>
                            {cake.name}
                          </p>
                        )}
                        <ul className='text-sm text-right'>
                          {typePrice('A')}
                          {typePrice('B')}
                          {typePrice('C')}
                        </ul>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          default:
            return null
        }
      },
      [INLINES.HYPERLINK]: node => {
        return (
          <a href={node.data.uri} target='_blank' rel='noopener noreferrer'>
            {(node.content[0] as Text).value}
          </a>
        )
      }
    }
  }
}

type Props = {
  content?: CommonRichText
  className?: string
  assetWidth?: number
}

const RichText: React.FC<Props> = ({ content, className, assetWidth }) => {
  if (!content?.json) return null

  return (
    <article
      className={`
        prose prose-neutral max-w-none
        prose-h2:mx-auto prose-h2:max-w-2xl
        prose-h3:mx-auto prose-h3:max-w-2xl
        prose-h4:mx-auto prose-h4:max-w-2xl
        prose-h5:mx-auto prose-h5:max-w-2xl
        prose-h6:mx-auto prose-h6:max-w-2xl
        prose-figure:mx-auto prose-figure:max-w-2xl
        prose-p:mx-auto prose-p:max-w-2xl
        prose-ul:mx-auto prose-ul:max-w-2xl
        prose-ul:list-[circle]
        prose-li:m-0
        marker:prose-li:text-neutral-700
        [&>p]:prose-li:m-0
        ${className}
      `}
      children={documentToReactComponents(
        content.json,
        richTextOptions({ links: content.links, assetWidth })
      )}
    />
  )
}

export default RichText
