import React from "react"
import { useStaticQuery, graphql } from "gatsby"
import { Link } from "gatsby"
import Img from "gatsby-image"

const Cards = ({ filter }) => {
  const data = useStaticQuery(graphql`
    {
      allProjects: allMarkdownRemark(
        sort: { fields: [frontmatter___date], order: DESC }
        filter: { fileAbsolutePath: { regex: "/(projects)/" } }
      ) {
        edges {
          node {
            fields {
              slug
            }
            frontmatter {
              title
              category
              thumbnail {
                childImageSharp {
                  fluid(maxWidth: 1280) {
                    ...GatsbyImageSharpFluid_withWebp
                  }
                }
              }
            }
          }
        }
      }
    }
  `)
  return (
    <div className="post-feed">
      {data.allProjects.edges
        .filter(function(node) {
          if (filter === "*") {
            return true
          } else {
            return node.node.frontmatter.category === filter
          }
        })
        .map(({ node }, index) => {
          if (node.frontmatter.thumbnail) {
            return (
              <article
                className={`post-card post with-image ${(index + 1) % 3 === 0 &&
                  `post-card-large`}`}
              >
                <Img
                  css={{ top: 0, left: 0, right: 0, bottom: 0 }}
                  style={{
                    position: `absolute`,
                    width: `100%`,
                    height: `100%`,
                  }}
                  fluid={node.frontmatter.thumbnail.childImageSharp.fluid}
                />
                <Link to={node.fields.slug} className="post-card-link">
                  <div className="post-card-content">
                    <h2 className="post-card-title">
                      {node.frontmatter.title || node.fields.slug}
                    </h2>
                  </div>
                </Link>
              </article>
            )
          } else {
            return (
              <article
                className={`post-card post no-image ${(index + 1) % 3 === 0 &&
                  `post-card-large`}`}
              >
                <Link to={node.fields.slug} className="post-card-link">
                  <div className="post-card-content">
                    <h2 className="post-card-title">
                      {node.frontmatter.title || node.fields.slug}
                    </h2>
                  </div>
                </Link>
              </article>
            )
          }
        })}
    </div>
  )
}

export default Cards
