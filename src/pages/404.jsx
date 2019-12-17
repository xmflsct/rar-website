import React from "react";
import { useStaticQuery, graphql, Link } from "gatsby";
import Img from "gatsby-image";

import Header from "../components/header";
import Footer from "../components/footer";
import SEO from "../components/seo";
import { Col, Container, Row } from "react-bootstrap";

const PageNotFound = () => {
  const data = useStaticQuery(graphql`
    query {
      image: file(relativePath: { regex: "/(404.jpg)/" }) {
        childImageSharp {
          fluid(maxWidth: 920) {
            ...GatsbyImageSharpFluid_withWebp
          }
        }
      }
    }
  `);
  return (
    <Container className="site-wrapper">
      <Header />
      <SEO
        title="404: where is the cake"
        keywords={["Round&Round", "Rotterdam", "404"]}
      />
      <Container as="main" id="site-main" className="site-main">
        <Container className="text-center">
          <Row>
            <Col as="h3" xs={12}>
              404: where is the cake
            </Col>
            <Link
              to="/cake-hightea/signature-cake-roll"
              className="mt-3 mb-5"
              style={{ marginLeft: "auto", marginRight: "auto" }}
            >
              Take a look at our signature cake roll?
            </Link>
            <Col xs={12}>
              <Img fluid={data.image.childImageSharp.fluid} />
            </Col>
          </Row>
        </Container>
      </Container>
      <Footer />
    </Container>
  );
};

export default PageNotFound;
