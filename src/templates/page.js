import React from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

class PageTemplate extends React.Component {
  render() {
    const post = this.props.data.markdownRemark

    return (
      <Layout
        location={this.props.location}
        title={this.props.data.site.siteMetadata.title}
      >
        <SEO
          title={post.frontmatter.title}
          description={post.frontmatter.description || post.excerpt}
        />
        <article className={"post-content no-image"}>
          <header className="post-content-header">
            <h2 className="post-content-title">{post.frontmatter.title}</h2>
          </header>

          <div
            className="post-content-body"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />

          <footer className="post-content-footer"></footer>
        </article>
      </Layout>
    )
  }
}

export default PageTemplate

export const pageQuery = graphql`
  query PageBySlug($slug: String!) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        description
      }
    }
  }
`
