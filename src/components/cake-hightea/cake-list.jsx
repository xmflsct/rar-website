import React from "react";

import Img from "gatsby-image";

import { currency } from "./currency";
import { Col, Container, Row } from "react-bootstrap";

const CakeList = ({ node }) => (
  <Col md={4} xs={12}>
    <Img
      fluid={node.frontmatter.thumbnail.childImageSharp.fluid}
      style={{
        position: "relative",
        overflow: "hidden",
        paddingBottom: "100%",
        height: "0"
      }}
    />
    <Row className="mt-2 no-gutters">
      <Col>
        <Container as="h6">{node.frontmatter.cake_hightea.name}</Container>
      </Col>
      <Container as="span" className="col-auto price">
        {node.frontmatter.cake_hightea.price
          ? node.frontmatter.cake_hightea.price.piece
            ? node.frontmatter.cake_hightea.price.whole
              ? `${currency(
                  node.frontmatter.cake_hightea.price.piece
                )}/${currency(node.frontmatter.cake_hightea.price.whole)}`
              : currency(node.frontmatter.cake_hightea.price.piece)
            : node.frontmatter.cake_hightea.price.whole
            ? currency(node.frontmatter.cake_hightea.price.whole)
            : ""
          : ""}
      </Container>
    </Row>

    {node.frontmatter.cake_hightea.description ? (
      <Container
        dangerouslySetInnerHTML={{
          __html: node.frontmatter.cake_hightea.description
        }}
        style={{ whiteSpace: "pre-line" }}
        className="description mb-4"
        fluid="true"
      />
    ) : (
      ""
    )}
  </Col>
);

export default CakeList;
