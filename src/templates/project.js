import React from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

class ProjectTemplate extends React.Component {
  render() {
    const post = this.props.data.markdownRemark

    return (
      <Layout
        location={this.props.location}
        title={this.props.data.site.siteMetadata.title}
        category={post.frontmatter.category}
      >
        <SEO
          title={post.frontmatter.title}
          description={post.frontmatter.description || post.excerpt}
        />
        <article
          className={`post-content ${post.frontmatter.thumbnail || `no-image`}`}
        >
          <header className="post-content-header">
            <h2 className="post-content-title">
              <sup>({post.frontmatter.date})</sup>
              {post.frontmatter.title}
            </h2>
          </header>

          <div
            lassName="post-content-body"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />

          <footer className="post-content-footer"></footer>
        </article>
      </Layout>
    )
  }
}

export default ProjectTemplate

export const pageQuery = graphql`
  query ProjectBySlug($slug: String!) {
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
        date(formatString: "YYYY")
        description
        category
      }
    }
  }
`
