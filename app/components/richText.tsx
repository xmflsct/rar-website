import { documentToReactComponents, Options } from '@contentful/rich-text-react-renderer'
import { BLOCKS, INLINES, Text } from '@contentful/rich-text-types'
import { Link } from '@remix-run/react'
import classNames from 'classnames'
import {
  Cake,
  CakesGroup,
  CommonImage,
  CommonRichText,
  DaysClosed,
  InternalAssetsGrid
} from '~/utils/contentful'
import { full } from '~/utils/currency'
import CakeView from './cakeView'
import Image from './image'

const richTextOptions = ({
  links,
  assetWidth,
  daysClosedCollection
}: {
  links: any
  assetWidth?: number
  daysClosedCollection: DaysClosed[]
}): Options => {
  const assetMap = new Map()
  if (links?.assets?.block) {
    for (const asset of links.assets.block) {
      assetMap.set(asset.sys?.id, asset)
    }
  }
  if (links?.assets?.hyperlink) {
    for (const asset of links.assets.hyperlink) {
      assetMap.set(asset.sys?.id, asset)
    }
  }

  const entryMap = new Map()
  if (links?.entries?.block) {
    for (const entry of links.entries?.block) {
      entryMap.set(entry.sys?.id, entry)
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
            {asset.description && <figcaption className='mt-1'>{asset.description}</figcaption>}
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
                className='not-prose border-t border-b py-4 my-8'
                children={<CakeView cake={cake} daysClosedCollection={daysClosedCollection} />}
              />
            )
          case 'CakesGroup':
            const cakesGroup = entry as CakesGroup
            return (
              <div className='not-prose mb-4'>
                <h2 className='text-neutral-900 text-2xl font-bold my-4'>{entry.name}</h2>
                <RichText
                  content={cakesGroup.description}
                  className='mb-4'
                  daysClosedCollection={daysClosedCollection}
                />
                <div className='grid grid-cols-2 lg:grid-cols-3 gap-4'>
                  {cakesGroup.cakesCollection?.items?.map(cake => {
                    const typePrice = (type: 'A' | 'B' | 'C') => {
                      const price = cake[`type${type}Price`]
                      const unit = cake[`type${type}Unit`]
                      const stock = cake[`type${type}Stock`]

                      if (!cake[`type${type}Available`]) return
                      if (price && unit) {
                        return (
                          <li
                            className={classNames(
                              typeof stock === 'number' && stock === 0 ? 'line-through' : null
                            )}
                          >
                            {full(price)} / {unit.unit}
                          </li>
                        )
                      }
                    }
                    return (
                      <Link key={cake.sys.id} to={`/cake/${cake.slug}`} className='group'>
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
          case 'InternalAssetsGrid':
            const grid = entry as InternalAssetsGrid
            const columns = (col: NonNullable<InternalAssetsGrid['columnsLarge']> = 1) =>
              ({
                1: 'grid-cols-1',
                2: 'grid-cols-2',
                3: 'grid-cols-3',
                4: 'grid-cols-4',
                5: 'grid-cols-5',
                6: 'grid-cols-6'
              }[col])
            return (
              <div
                className={classNames(
                  'grid gap-4',
                  columns(grid.columnsSmall),
                  `md:${columns(grid.columnsMedium)}`,
                  `lg:${columns(grid.columnsLarge)}`
                )}
              >
                {grid.assetsCollection?.items.map((asset, index) => (
                  <figure key={index} className='my-0 lg:my-auto'>
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
                ))}
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
      },
      [INLINES.ASSET_HYPERLINK]: node => {
        const asset = assetMap.get(node.data.target.sys.id)
        if (!asset) return

        return (
          <a href={asset.url} target='_blank' rel='noopener noreferrer'>
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
  daysClosedCollection: DaysClosed[]
}

const RichText: React.FC<Props> = ({ content, className, assetWidth, daysClosedCollection }) => {
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
        prose-hr:mx-auto prose-hr:max-w-2xl
        prose-ol:mx-auto prose-ol:max-w-2xl
        prose-ul:mx-auto prose-ul:max-w-2xl
        prose-ul:list-[circle]
        prose-li:m-0
        marker:prose-li:text-neutral-700
        [&>p]:prose-li:m-0
        ${className}
      `}
      children={documentToReactComponents(
        content.json,
        richTextOptions({ links: content.links, assetWidth, daysClosedCollection })
      )}
    />
  )
}

export default RichText
