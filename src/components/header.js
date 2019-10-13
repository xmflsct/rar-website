import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { Link } from "gatsby"

import { FiLinkedin } from "react-icons/fi"
import { FiInstagram } from "react-icons/fi"
import { FiGithub } from "react-icons/fi"

const Header = ({ category }) => {
  const [toggleNav, setToggleNav] = React.useState(false)

  const data = useStaticQuery(graphql`
    {
      site {
        siteMetadata {
          title
        }
      }
      allCategories: allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/(projects)/" } }
      ) {
        group(field: frontmatter___category) {
          fieldValue
        }
      }
      allPages: allMarkdownRemark(
        sort: { fields: [frontmatter___page_order], order: ASC }
        filter: { fileAbsolutePath: { regex: "/pages/" } }
      ) {
        edges {
          node {
            fields {
              slug
            }
            frontmatter {
              name
            }
          }
        }
      }
    }
  `)
  return (
    <header className={`site-head ${toggleNav ? `site-head-open` : ``}`}>
      <div className="site-head-container">
        <button className="hamburger nav-burger" onClick={() => setToggleNav(!toggleNav)}>
          <div
            className="hamburger hamburger--collapse"
            aria-label="Menu"
            role="button"
            aria-controls="navigation"
          >
            <div className="hamburger-box">
              <div className="hamburger-inner" />
            </div>
          </div>
        </button>
        <nav id="swup" class="site-head-left">
          <ul className="nav" role="menu">
            <li className="top-nav" role="menuitem">
              <Link to={`/`} activeClassName="active">
                All Projects
              </Link>
              <ul>
                {data.allCategories.group.map(({ fieldValue }) => (
                  <li className="sub-nav">
                    <Link to={"/" + fieldValue.toLowerCase()} activeClassName="active" className={category === fieldValue ? "active" : " "}>
                      {fieldValue}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            {data.allPages.edges.map(({ node }) => (
              <li className="top-nav" role="menuitem">
                <Link to={node.fields.slug} activeClassName="active">
                  {node.frontmatter.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="site-head-center">
          <Link className="site-head-logo" to={`/`}>
            {data.site.siteMetadata.title}
          </Link>
        </div>
        <div className="site-head-right">
          <div className="social-links">
            <a
              href="https://www.linkedin.com/in/xmflsct/"
              title="LinkedIn"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiLinkedin />
            </a>
            <a
              href="https://www.instagram.com/xmflsct/"
              title="Instagram"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiInstagram />
            </a>
            <a
              href="https://github.com/xmflsct/"
              title="GitHub"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FiGithub />
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
