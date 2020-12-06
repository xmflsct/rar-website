import React from 'react'
import { graphql } from 'gatsby'
import Img from 'gatsby-image'
import { BLOCKS } from '@contentful/rich-text-types'
import { documentToReactComponents } from '@contentful/rich-text-react-renderer'

import Layout from '../layouts/layout'
import CakesList from '../components/cakes-list'

const TemplateCakesPage = ({ data }) => {
  const options = {
    renderNode: {
      [BLOCKS.EMBEDDED_ASSET]: (node, children) => {
        const theImage = data.allImages.nodes.filter(
          ({ contentful_id }) =>
            contentful_id === node.data.target.sys.contentful_id
        )
        return <Img fluid={theImage[0].fluid} />
      }
    },
    renderText: text => text.replace('!', '?')
  }

  return (
    <Layout
      name='cakes-page'
      SEOtitle={data.cakesPage.heading}
      SEOkeywords={[data.cakesPage.heading, 'Round&Round', 'Rotterdam']}
    >
      <h1>{data.cakesPage.heading}</h1>
      {documentToReactComponents(data.cakesPage.description?.json, options)}
      {data.cakesPage.cakesLists?.map(cakesList => (
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
    allImages: allContentfulAsset {
      nodes {
        contentful_id
        fluid(maxWidth: 700) {
          ...GatsbyContentfulFluid_withWebp
        }
      }
    }
  }
`

export default TemplateCakesPage
