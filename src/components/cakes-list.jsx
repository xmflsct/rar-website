import React from "react"
import { Row } from "react-bootstrap"
import { graphql } from "gatsby"
import { documentToReactComponents } from "@contentful/rich-text-react-renderer"

import CakesCake from "./cakes-cake"

const ComponentCakesList = ({ cakesList }) => {
  return (
    <div className='cakes-list'>
      <h2>{cakesList.heading}</h2>
      {documentToReactComponents(cakesList.description?.json)}
      <Row className='cakes-cakes'>
        {cakesList.cakesCakes?.map((cakesCake) => (
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
