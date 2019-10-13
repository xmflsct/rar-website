import React from "react"
import { graphql } from "gatsby"
import Img from "gatsby-image"

import Layout from "../components/layout"
import SEO from "../components/seo"

class NotFoundPage extends React.Component {
  render() {
    const { data } = this.props
    const siteTitle = data.site.siteMetadata.title

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO title="404: Not Found" />
        <article className={"post-content no-image"}>
          <header className="post-content-header">
            <h2 className="post-content-title">404: not found what you need</h2>
          </header>
          <Img
            fluid={data.image.childImageSharp.fluid}
            className="kg-image"
          />
        </article>
      </Layout>
    )
  }
}

export default NotFoundPage

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    image: file (
      relativePath: { eq: "404.jpg" }
    ) {
      childImageSharp {
        fluid(maxWidth: 1280) {
          ...GatsbyImageSharpFluid_withWebp
        }
      }
    }
  }
`
