import React from "react"
import { graphql } from "gatsby"
import { documentToReactComponents } from "@contentful/rich-text-react-renderer"

import Layout from "../layouts/layout"
import CakesList from "../components/cakes-list"

const TemplateCakesPage = ({ data }) => {
  return (
    <Layout
      name='cakes-page'
      SEOtitle={data.cakesPage.heading}
      SEOkeywords={[data.cakesPage.heading, "Round&Round", "Rotterdam"]}
    >
      <h1>{data.cakesPage.heading}</h1>
      {documentToReactComponents(data.cakesPage.description?.json)}
      {data.cakesPage.cakesLists?.map((cakesList) => (
        <CakesList key={cakesList.heading} cakesList={cakesList} />
      ))}
    </Layout>
  )
}

export const query = graphql`
  query queryCakesPage($contentful_id: String) {
    cakesPage: contentfulCakesPage(contentful_id: { eq: $contentful_id }) {
      heading
      description {
        json
      }
      cakesLists {
        ...CakesList
      }
    }
  }
`

export default TemplateCakesPage
