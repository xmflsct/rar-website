import React from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"
import Cards from "../components/cards"

class CategoryTemplate extends React.Component {
  render() {
    return (
      <Layout
        location={this.props.location}
        title={this.props.data.site.siteMetadata.title}
      >
        <SEO
          title={this.props.data.site.siteMetadata.title}
          description={this.props.data.site.siteMetadata.description}
        />
        {this.props.data.site.siteMetadata.description && (
          <header className="page-head">
            <h2 className="page-head-title">
              Passionate experience designer, currently based in{" "}
              <a
                href="https://visitsweden.com/stockholm/"
                title="Stockholm"
                target="_blank"
                rel="noopener noreferrer"
              >
                Stockholm
              </a>
            </h2>
          </header>
        )}

        <Cards filter={this.props.pageContext.category}/>
      </Layout>
    )
  }
}

export default CategoryTemplate

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
        description
      }
    }
  }
`
