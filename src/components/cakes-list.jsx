import React from 'react'
import { Row } from 'react-bootstrap'
import { graphql } from 'gatsby'
import Img from 'gatsby-image'
import { BLOCKS } from '@contentful/rich-text-types'
import { documentToReactComponents } from '@contentful/rich-text-react-renderer'

import CakesCake from './cakes-cake'

const ComponentCakesList = ({ cakesList, allImages }) => {
  const options = {
    renderNode: {
      [BLOCKS.EMBEDDED_ASSET]: node => {
        console.log(node)
        const theImage = allImages.nodes.filter(
          ({ contentful_id }) =>
            contentful_id === node.data.target.sys.contentful_id
        )
        return <Img fluid={theImage[0].fluid} className='list-image' />
      }
    },
    renderText: text => text.replace('!', '?')
  }

  return (
    <div className='cakes-list'>
      <h2>{cakesList.heading}</h2>
      {documentToReactComponents(cakesList.description?.json, options)}
      <Row className='cakes-cakes'>
        {cakesList.cakesCakes?.map(cakesCake => (
          <CakesCake key={cakesCake.contentful_id} cakesCake={cakesCake} />
        ))}
      </Row>
    </div>
  )
}

export const query = graphql`
  fragment CakesList on ContentfulCakesList {
    heading
    description {
      json
    }
    cakesCakes {
      ...CakesCake
    }
  }
`

export default ComponentCakesList
