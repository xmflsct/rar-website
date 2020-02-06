import React from "react";

import SEO from "./layout/seo";
import Header from "./layout/header";
import Sidebar from "./layout/sidebar";
import Footer from "./layout/footer";
import { Button, Col, Container, Row } from "react-bootstrap";

const Layout = props => {
  const [toggleNav, setToggleNav] = React.useState(false);

  const { children, location, name, SEOtitle, SEOkeywords } = props;

  return (
    <Container
      className={`site-wrapper ${name} ${toggleNav ? "site-head-open" : ""}`}
    >
      <SEO title={SEOtitle} keywords={SEOkeywords} />
      <Button
        className={`nav-burger hamburger hamburger--collapse ${
          toggleNav ? "is-active" : ""
        }`}
        variant="link"
        onClick={() => setToggleNav(!toggleNav)}
      >
        <span className="hamburger-box">
          <span className="hamburger-inner"></span>
        </span>
      </Button>

      <Header />

      <Row as="main">
        <Col lg={3}>
          <Sidebar location={location} />
        </Col>
        <Col md={12} lg={9} className="content">
          {children}
        </Col>
      </Row>

      <Footer />
    </Container>
  );
};

export default Layout;
