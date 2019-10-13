import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { Link } from "gatsby"

const Footer = () => {
  const data = useStaticQuery(graphql`
    {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)
  return (
    <footer className="site-foot">
      &copy; {new Date().getFullYear()} <Link to={`/`}>{data.site.siteMetadata.title}</Link> &mdash;
      Built with{" "}
      <a
        href="https://gatsbyjs.org"
        target="_blank"
        rel="noopener noreferrer"
      >
        Gatsby
      </a>
      , hosted by{" "}
      <a
        href="https://pages.github.com/"
        target="_blank"
        rel="noopener noreferrer"
      >
        GitHub Pages
      </a>
    </footer>
  )
}

export default Footer
