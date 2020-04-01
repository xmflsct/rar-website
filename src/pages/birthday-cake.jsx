import React from "react"
import { useStaticQuery, graphql } from "gatsby"

import Layout from "../layouts/layout"
import ListThings from "../components/list-things/list-things"

const TestTest = () => {
  const data = useStaticQuery(graphql`
    {
      cakeA: contentfulCakesCakeList(
        contentful_id: { eq: "7DKcphH2mLyGWMDTgUH89P" }
      ) {
        cakes {
          contentful_id
          image {
            fluid(maxWidth: 400) {
              ...GatsbyContentfulFluid
            }
          }
          name
          pricePiece
          priceWhole
          availability
          description {
            json
          }
        }
      }
      cakeB: contentfulCakesCakeList(
        contentful_id: { eq: "u7eAu6AfSqmOVpCwE019H" }
      ) {
        cakes {
          contentful_id
          image {
            fluid(maxWidth: 400) {
              ...GatsbyContentfulFluid
            }
          }
          name
          pricePiece
          priceWhole
          availability
          description {
            json
          }
        }
      }
      cakeC: contentfulCakesCakeList(
        contentful_id: { eq: "4jfUsFXdxP0YtsCK19kMs3" }
      ) {
        cakes {
          contentful_id
          image {
            fluid(maxWidth: 400) {
              ...GatsbyContentfulFluid
            }
          }
          name
          pricePiece
          priceWhole
          availability
          description {
            json
          }
        }
      }
      cakeD: contentfulCakesCakeList(
        contentful_id: { eq: "7Gp3BMdBEWbbHfOz05xvRc" }
      ) {
        cakes {
          contentful_id
          image {
            fluid(maxWidth: 400) {
              ...GatsbyContentfulFluid
            }
          }
          name
          pricePiece
          priceWhole
          availability
          description {
            json
          }
        }
      }
      cakeE: contentfulCakesCakeList(
        contentful_id: { eq: "2VSsrXcHMzf9NUtVUdlX45" }
      ) {
        cakes {
          contentful_id
          image {
            fluid(maxWidth: 400) {
              ...GatsbyContentfulFluid
            }
          }
          name
          pricePiece
          priceWhole
          availability
          description {
            json
          }
        }
      }
    }
  `)
  return (
    <Layout
      name='birthday-cake'
      SEOtitle='Birthday Cake'
      SEOkeywords={["Birthday cake", "Rotterdam"]}
    >
      <h1>Birthday Cake</h1>

      <p>
        Our birthday cake is made with soft chiffon cake with fresh cream,
        mascarpone, bio-jam and fresh fruit. The birthday cakes below can be
        pre-ordered by sending us an email, calling us or Facebook messaging us.
        You can just let us know the style number. Please order 5 days in
        advance for certainty.
      </p>
      <p>
        Usually we will put &quot;Happy Birthday&quot; chocolate tag and Bunny
        cookies as shown in the cake photos. If you want to skip it, please let
        us know. If you want other text than &quot;Happy Birthday&quot;, it is
        possible to have a paper message tag on the cake. Please leave us the
        message when you place the order (please keep the message short).
      </p>

      <h2>A. 6” Cakes (for 2-4 people) € 19,-</h2>
      <p>Vanilla Chiffon base. (Cacao/Matcha Base + € 2,-)</p>
      <ListThings things={data.cakeA.cakes} />

      <h2>B. 8” Cakes (for 6-8 people) € 26,-</h2>
      <p>Vanilla Chiffon base. (Cacao/Matcha Base + € 2,-)</p>
      <ListThings things={data.cakeB.cakes} />

      <h2>C. 10” Cakes (for 10-12 people) € 33,-</h2>
      <p>Vanilla Chiffon base. (Cacao/Matcha Base + € 2,-)</p>
      <ListThings things={data.cakeC.cakes} />

      <h2>D. Flower Deco High Cakes (for a small party) € 45,-</h2>
      <p>
        <b>Base:</b> 3 layers of 8” Chiffon cakes (Default flavour Matcha, you
        can also choose Vanilla/ Cacao).
        <br />
        <b>Cream flavour:</b> Vanilla, Strawberry or Lemon.
        <br />
        <b>Filling:</b> Strawberry or Mango.
        <br />
        <i>
          * We use seasonal flowers. If you have any color theme preference,
          please let us know.
        </i>
      </p>
      <ListThings things={data.cakeD.cakes} />

      <h2>E. Celebration Cakes</h2>
      <ListThings things={data.cakeE.cakes} />
    </Layout>
  )
}

export default TestTest
