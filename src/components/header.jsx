import React from "react";
import { useStaticQuery, graphql, Link } from "gatsby";
import Img from "gatsby-image";
import { Col, Container, Row } from "react-bootstrap";

import OpeningHours from "./sidebar/opening-hours";

const Header = () => {
  const data = useStaticQuery(graphql`
    {
      file(relativePath: { regex: "/(header/logo.png)/" }) {
        childImageSharp {
          fluid(maxWidth: 300) {
            ...GatsbyImageSharpFluid_withWebp_noBase64
          }
        }
      }
    }
  `);
  return (
    <Container as="header">
      <Row>
        <Col lg={3} md={12} className="header-left">
          <Link to="/">
            <Img className="m-3" fluid={data.file.childImageSharp.fluid} />
          </Link>
          <Container className="opening-hours-details">
            <OpeningHours />
          </Container>
        </Col>
        <Col lg={9} className="header-center">
          <Container as="p">A Little</Container>
          <Container as="p">
            <b>Matcha</b> Forest
          </Container>
          <Container as="p">in Rotterdam.</Container>
        </Col>
      </Row>
    </Container>
  );
};

export default Header;
