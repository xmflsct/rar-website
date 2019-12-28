import React from "react";
import { useStaticQuery, graphql, Link } from "gatsby";
import Img from "gatsby-image";
import { Col, Row } from "react-bootstrap";

import OpeningHours from "./sidebar/opening-hours";

const Header = () => {
  const data = useStaticQuery(graphql`
    {
      file(relativePath: { regex: "/(header/logo.png)/" }) {
        childImageSharp {
          fluid(maxWidth: 400) {
            ...GatsbyImageSharpFluid_withWebp_noBase64
          }
        }
      }
    }
  `);
  return (
    <Row as="header">
      <Col lg={3} md={12} className="header-left">
        <Link to="/">
          <Img className="m-3" fluid={data.file.childImageSharp.fluid} />
        </Link>
        <div className="opening-hours-details">
          <OpeningHours />
        </div>
      </Col>
      <Col lg={9} className="header-center">
        <p>A Little</p>
        <p>
          <b>Matcha</b> Forest
        </p>
        <p>in Rotterdam.</p>
      </Col>
    </Row>
  );
};

export default Header;
