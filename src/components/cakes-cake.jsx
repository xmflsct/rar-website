import React, { useState } from 'react'
import { Button, Col, Collapse } from 'react-bootstrap'
import { graphql } from 'gatsby'
import Img from 'gatsby-image'
import { documentToReactComponents } from '@contentful/rich-text-react-renderer'

import CakeOrder from './cake-order'
import * as currency from './utils/currency'

const ComponentCakesCake = ({ cakesCake }) => {
  const [cakeOrder, setCakeOrder] = useState(false)

  return (
    <Col key={cakesCake.contentful_id} md={4} xs={6} className='cakes-cake'>
      <Img
        fluid={cakesCake.image.fluid}
        style={{
          position: 'relative',
          overflow: 'hidden',
          paddingBottom: '100%',
          height: '0'
        }}
      />
      {cakesCake.availableOnline ? (
        <h6 className='cake-name'>{cakesCake.name}</h6>
      ) : (
        <h6 className='cake-name'>{cakesCake.name}</h6>
      )}
      {/* {!cakesCake.customizationBirthdayCake && ( */}
      <div className='cake-price'>
        {cakesCake.typeAPrice && (
          <p>
            {currency.full(cakesCake.typeAPrice)}/{cakesCake.typeAUnit.typeUnit}
          </p>
        )}
        {cakesCake.typeBPrice && (
          <p>
            {currency.full(cakesCake.typeBPrice)}/{cakesCake.typeBUnit.typeUnit}
          </p>
        )}
        {cakesCake.typeCPrice && (
          <p>
            {currency.full(cakesCake.typeCPrice)}/{cakesCake.typeCUnit.typeUnit}
          </p>
        )}
      </div>
      {/* )} */}
      {cakesCake.description && (
        <div className='cake-description'>
          {documentToReactComponents(cakesCake.description?.json)}
        </div>
      )}
      {cakesCake.availableOnline ? (
        <>
          <Button
            variant='rar'
            onClick={() => setCakeOrder(!cakeOrder)}
            aria-expanded={cakeOrder}
            className={cakeOrder ? 'd-none' : ''}
          >
            Add my order
          </Button>
          <Collapse in={cakeOrder}>
            <div>
              <CakeOrder cake={cakesCake} />
            </div>
          </Collapse>
        </>
      ) : (
        <>
          <Button variant='outline-dark' disabled>
            Request by Email
          </Button>
        </>
      )}
    </Col>
  )
}

export const query = graphql`
  fragment CakesCake on ContentfulCakesCake {
    contentful_id
    image {
      fluid(maxWidth: 800) {
        ...GatsbyContentfulFluid_withWebp
      }
    }
    name
    availableOnline
    typeAPrice
    typeAUnit {
      typeUnit
    }
    typeBPrice
    typeBUnit {
      typeUnit
    }
    typeCPrice
    typeCUnit {
      typeUnit
    }
    customizationBirthdayCake {
      type
      options
    }
    description {
      json
    }
  }
`

export default ComponentCakesCake
