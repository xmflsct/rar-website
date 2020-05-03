import React from "react"
import { useStaticQuery, graphql, Link } from "gatsby"
import Img from "gatsby-image"

import Layout from "../layouts/layout"

const PageNotFound = () => {
  const data = useStaticQuery(graphql`
    query {
      image: file(relativePath: { eq: "page-404/404.jpg" }) {
        childImageSharp {
          fluid(maxWidth: 650) {
            ...GatsbyImageSharpFluid_withWebp
          }
        }
      }
    }
  `)
  return (
    <Layout>
      <h1>404: where is the cake</h1>
      <h3 className='text-center mt-3'>
        <Link
          to='/cakes-and-sweets'
          style={{ marginLeft: "auto", marginRight: "auto" }}
        >
          Take a look at our online cake ordering?
        </Link>
      </h3>
      <Img className="mt-5" fluid={data.image.childImageSharp.fluid} />
    </Layout>
  )
}

export default PageNotFound
