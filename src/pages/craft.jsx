import React from "react";
import { useStaticQuery, graphql } from "gatsby";
import Img from "gatsby-image";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

import Layout from "../components/layout";

const OurStory = ({ location }) => {
  const data = useStaticQuery(graphql`
    {
      craft: allFile(
        filter: { relativeDirectory: { regex: "/(craft)/" } }
        sort: { order: ASC, fields: name }
      ) {
        nodes {
          childImageSharp {
            fluid(maxWidth: 250) {
              ...GatsbyImageSharpFluid_withWebp
            }
          }
          name
        }
      }
    }
  `);
  return (
    <Layout
      location={location}
      name="craft"
      SEOtitle="Craft"
      SEOkeywords={["Craft", "Rotterdam"]}
    >
      <h3 className="sub-heading mb-3" id="selected">
        Selected by Round&amp;Round
      </h3>
      <Row>
        <Col xs={12} md={4}>
          <Img fluid={data.craft.nodes[0].childImageSharp.fluid} />
          <p className="mt-2 mb-0">
            <b>Japanese Souveniors</b>
          </p>
          <p>Selected pieces from our Japan trip</p>
        </Col>
        <Col xs={12} md={4}>
          <Img fluid={data.craft.nodes[1].childImageSharp.fluid} />
          <p className="mt-2 mb-0">
            <b>4th Market</b>
          </p>
          <p>Japanese Ceramics</p>
        </Col>
        <Col xs={12} md={4}>
          <Img fluid={data.craft.nodes[2].childImageSharp.fluid} />
          <p className="mt-2 mb-0">
            <b>Stella Elhorst</b>
          </p>
          <p>Illustration Cards</p>
        </Col>
        <Col xs={12} md={4}>
          <Img fluid={data.craft.nodes[3].childImageSharp.fluid} />
          <p className="mt-2 mb-0">
            <b>Donna Wilson</b>
          </p>
          <p>Home Style, Toys, Accessories &amp; Cards</p>
        </Col>
        <Col xs={12} md={4}>
          <Img fluid={data.craft.nodes[4].childImageSharp.fluid} />
          <p className="mt-2 mb-0">
            <b>Chia DNA</b>
          </p>
          <p>Illustration crafts</p>
        </Col>
        <Col xs={12} md={4}>
          <Img fluid={data.craft.nodes[5].childImageSharp.fluid} />
          <p className="mt-2 mb-0">
            <b>Min-Jia Wang</b>
          </p>
          <p>Ceramics</p>
        </Col>
        <Col xs={12} md={4}>
          <Img fluid={data.craft.nodes[6].childImageSharp.fluid} />
          <p className="mt-2 mb-0">
            <b>Lucia Contreras</b>
          </p>
          <p>Illustration Prints/Cards</p>
        </Col>
        <Col xs={12} md={4}>
          <Img fluid={data.craft.nodes[7].childImageSharp.fluid} />
          <p className="mt-2 mb-0">
            <b>HARU HARU</b>
          </p>
          <p>Skin Care</p>
        </Col>
        <Col xs={12} md={4}>
          <Img fluid={data.craft.nodes[8].childImageSharp.fluid} />
          <p className="mt-2 mb-0">
            <b>Yas Lab</b>
          </p>
          <p>Leather Key Holders</p>
        </Col>
      </Row>
    </Layout>
  );
};

export default OurStory;
