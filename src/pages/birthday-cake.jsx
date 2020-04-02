import React from "react"
import { useStaticQuery, graphql } from "gatsby"

import Layout from "../layouts/layout"
import ListThings from "../components/list-things/list-things"
import * as currency from "../components/utils/currency"

const TestTest = () => {
  const data = useStaticQuery(graphql`
    {
      cakes: contentfulCakesCakeList(
        contentful_id: { eq: "66kWq7G8iHCqpuE9VaQARa" }
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
      <h1>Birthday Cakes</h1>

      <p>
        To reserve birthday cakes, please fill in the ordering form at the
        bottom of this page. Please book 5 days in advance for certainty.
      </p>
      <p>
        * Due to current not-so-easy situation, we have to scale down the
        choices of our cake styles. We will keep this page updated with the
        latest styles that we can prepare. :)
      </p>

      <h2>Cake Fruit Filling:</h2>
      <p>
        For all the styles, you can choose the filling fruits from:
        <br />
        mango, lychee, peach or strawberry&amp;raspberry mix
      </p>
      <p>
        * Because of unstable supply, we have to pause using fresh strawberry
        filling in this period. Instead you can choose our high quality frozen
        berry mix filling.
      </p>

      <h2>Cake Sizes:</h2>
      <p>
        All the cakes below are available in <strong>3</strong> sizes.
        <br />
        Please understand that the final look of each size would be slightly
        different)
      </p>
      <ul>
        <li>6'' Cake ⌀ 15cm {currency.full(19)}</li>
        <li>8'' Cake ⌀ 20cm {currency.full(28)}</li>
        <li>10'' Cake ⌀ 25cm {currency.full(37)}</li>
      </ul>

      <h2>Cake Base:</h2>
      <p className="mb-4">Default: Vanilla Chiffon<br />Cacao/Matcha base is also possible (+ {currency.full(2)})</p>

      <ListThings things={data.cakes.cakes} />
    </Layout>
  )
}

export default TestTest
