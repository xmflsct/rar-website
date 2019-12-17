import React from "react";
import { useStaticQuery, graphql, Link } from "gatsby";
import { Container } from "react-bootstrap";

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
    <Container as="footer" className="mt-5 mb-3 pt-3 text-center">
      <Link to="/">{data.site.siteMetadata.title}</Link> &copy; 2016-
      {new Date().getFullYear()} &mdash; Made with ❤ by{" "}
      <a href="https://xmflsct.com" target="_blank" rel="noopener noreferrer">
        xmflsct
      </a>
    </Container>
  );
};

export default Footer;
