import React from "react";
import { Col, Row } from "react-bootstrap";
import Img from "gatsby-image";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { currency } from "./currency";

const CakeList = ({ cakes }) => (
  <Row>
    {cakes.map(cake => (
      <Col key={cake.name} md={4} xs={12} className="mb-4">
        <Img
          fluid={cake.image.fluid}
          style={{
            position: "relative",
            overflow: "hidden",
            paddingBottom: "100%",
            height: "0"
          }}
        />
        <Row className="mt-2 no-gutters">
          <Col>
            <h6>{cake.name}</h6>
          </Col>
          <span className="col-auto price">
            {cake.pricePiece || cake.priceWhole
              ? cake.pricePiece
                ? cake.priceWhole
                  ? `${currency(cake.pricePiece)}/${currency(cake.priceWhole)}`
                  : currency(cake.pricePiece)
                : cake.priceWhole
                ? currency(cake.priceWhole)
                : ""
              : ""}
          </span>
        </Row>
        <Row className="description">
          <Col>
            {cake.description
              ? documentToReactComponents(cake.description.json)
              : ""}
          </Col>
        </Row>
      </Col>
    ))}
  </Row>
);

export default CakeList;
