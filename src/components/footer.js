import React from "react";
import { useStaticQuery, graphql } from "gatsby";
import { Link } from "gatsby";

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
    <footer className="footer mt-5 mb-3 pt-3 text-center font-weight-light">
      <Link to={`/`}>{data.site.siteMetadata.title}</Link> &copy; 2016-
      {new Date().getFullYear()} &mdash; Made with ❤ by{" "}
      <a href="https://xmflsct.com" target="_blank" rel="noopener noreferrer">
        xmflsct
      </a>
    </footer>
  );
};

export default Footer;
