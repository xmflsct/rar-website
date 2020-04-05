import React from "react"
import { Col, Row } from "react-bootstrap"
import Img from "gatsby-image"
import { documentToReactComponents } from "@contentful/rich-text-react-renderer"

import ThingForm from "./thing-form"
import * as currency from "../utils/currency"

const ListThings = ({ things, shoppable }) => {
  return (
    <Row className="list-things">
      {things.map(thing => (
        <Col key={thing.contentful_id} md={4} sm={12} className='one-thing mb-4'>
          <Img
            fluid={thing.image.fluid}
            style={{
              position: "relative",
              overflow: "hidden",
              paddingBottom: "100%",
              height: "0"
            }}
          />
          <Row className='mt-2 no-gutters'>
            <Col>
              {thing.availability ? (
                <h6>{thing.name}</h6>
              ) : (
                <h6>
                  <strike>{thing.name}</strike>
                </h6>
              )}
            </Col>
            <span className='col-auto price'>
              {thing.availability && (thing.pricePiece || thing.priceWhole)
                ? thing.pricePiece
                  ? thing.priceWhole
                    ? `${currency.full(thing.pricePiece)}/${currency.full(
                        thing.priceWhole
                      )}`
                    : currency.full(thing.pricePiece)
                  : thing.priceWhole
                  ? currency.full(thing.priceWhole)
                  : ""
                : ""}
            </span>
          </Row>
          <Row className='description'>
            <Col>
              {thing.description
                ? documentToReactComponents(thing.description.json)
                : ""}
            </Col>
          </Row>
          {shoppable && <ThingForm thing={thing} />}
        </Col>
      ))}
    </Row>
  )
}

export default ListThings
