import React from "react"
import { useStaticQuery, graphql } from "gatsby"

import Layout from "../layouts/layout"
import ListThings from "../components/list-things/list-things"

const OrderCakes = () => {
  const data = useStaticQuery(graphql`
    {
      things: contentfulCakesCakeList(
        contentful_id: { eq: "2YNSMPnD9oZ9fxjFX212dw" }
      ) {
        cakes {
          contentful_id
          image {
            fluid(maxWidth: 200) {
              ...GatsbyContentfulFluid_withWebp
            }
          }
          name
          pricePiece
          priceWhole
          wholeIdentity
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
      name='cakes-list'
      SEOtitle='Birthday Cake'
      SEOkeywords={["Birthday cake", "Rotterdam"]}
    >
      <h1>Cake Rolls, Other Cakes and Sweets</h1>
      <p>
        Below are the cakes that can be ordered in advance online, and pick-up
        in our shop.
      </p>
      <p>
        One entire cake roll is about 22cm long. One cake roll slice is about
        3cm long. We can slice your entire roll order into slices, usually in 7
        pieces. If needed, please leave a note when you checkout.
      </p>
      <p>
        We highly recommend to order in advance for centainty. It is also easier
        for us to prepare for you. We will pack your order in advance so the
        pick-up process will be faster.
      </p>
      <p>
        You can also just drop by during our opening hours to buy cakes and
        drinks <strong>for take away</strong>.
      </p>
      <p>
        Please mind social distancing. We only allow <strong>1 guest</strong>{" "}
        drop in each time.
        <br />
        Thank you for your understanding!
      </p>
      <h3>Our Cake Menu [April &amp; May]</h3>
      <ListThings things={data.things.cakes} shoppable />
    </Layout>
  )
}

export default OrderCakes
