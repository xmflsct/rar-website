import React from "react";
import { useStaticQuery, graphql, Link } from "gatsby";
import { Col, Row } from "react-bootstrap";

const Footer = () => {
  const data = useStaticQuery(graphql`
    {
      site {
        siteMetadata {
          title
        }
      }
    }
  `);
  return (
    <Row as="footer" className="mt-5 mb-3 pt-3">
      <Col className="text-center">
        <Link to="/">{data.site.siteMetadata.title}</Link> &copy; 2016-
        {new Date().getFullYear()} &mdash; Made with ❤ by{" "}
        <a href="https://xmflsct.com" target="_blank" rel="noopener noreferrer">
          xmflsct
        </a>
      </Col>
    </Row>
  );
};

export default Footer;
