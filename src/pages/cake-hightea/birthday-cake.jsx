import React from "react";
import { useStaticQuery, graphql } from "gatsby";

import Layout from "../../components/layout";
import CakeList from "../../components/cake-hightea/cake-list";

const BirthdayCake = ({ location }) => {
  const data = useStaticQuery(graphql`
    {
      cakeA: allContentfulCakesCakeList(
        filter: { contentful_id: { eq: "7DKcphH2mLyGWMDTgUH89P" } }
        sort: { order: ASC }
      ) {
        edges {
          node {
            cakes {
              image {
                fluid(maxWidth: 400) {
                  ...GatsbyContentfulFluid
                }
              }
              name
              pricePiece
              priceWhole
              description {
                json
              }
            }
          }
        }
      }
      cakeB: allContentfulCakesCakeList(
        filter: { contentful_id: { eq: "u7eAu6AfSqmOVpCwE019H" } }
        sort: { order: ASC }
      ) {
        edges {
          node {
            cakes {
              image {
                fluid(maxWidth: 400) {
                  ...GatsbyContentfulFluid
                }
              }
              name
              pricePiece
              priceWhole
              description {
                json
              }
            }
          }
        }
      }
      cakeC: allContentfulCakesCakeList(
        filter: { contentful_id: { eq: "4jfUsFXdxP0YtsCK19kMs3" } }
        sort: { order: ASC }
      ) {
        edges {
          node {
            cakes {
              image {
                fluid(maxWidth: 400) {
                  ...GatsbyContentfulFluid
                }
              }
              name
              pricePiece
              priceWhole
              description {
                json
              }
            }
          }
        }
      }
      cakeD: allContentfulCakesCakeList(
        filter: { contentful_id: { eq: "7Gp3BMdBEWbbHfOz05xvRc" } }
        sort: { order: ASC }
      ) {
        edges {
          node {
            cakes {
              image {
                fluid(maxWidth: 400) {
                  ...GatsbyContentfulFluid
                }
              }
              name
              pricePiece
              priceWhole
              description {
                json
              }
            }
          }
        }
      }
      cakeE: allContentfulCakesCakeList(
        filter: { contentful_id: { eq: "2VSsrXcHMzf9NUtVUdlX45" } }
        sort: { order: ASC }
      ) {
        edges {
          node {
            cakes {
              image {
                fluid(maxWidth: 400) {
                  ...GatsbyContentfulFluid
                }
              }
              name
              pricePiece
              priceWhole
              description {
                json
              }
            }
          }
        }
      }
    }
  `);
  return (
    <Layout
      location={location}
      name="cake-hightea birthday-cake"
      SEOtitle="Birthday Cake"
      SEOkeywords={["Birthday cake", "Rotterdam"]}
    >
      <h3 className="sub-heading mb-3">Birthday Cake</h3>

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

      <h5 className="sub-heading mt-4">A. 6” Cakes (for 2-4 people) € 19,-</h5>
      <p>Vanilla Chiffon base. (Cacao/Matcha Base + € 2,-)</p>
      <CakeList cakes={data.cakeA.edges[0].node.cakes} />

      <h5 className="sub-heading mt-4">B. 8” Cakes (for 6-8 people) € 26,-</h5>
      <p>Vanilla Chiffon base. (Cacao/Matcha Base + € 2,-)</p>
      <CakeList cakes={data.cakeB.edges[0].node.cakes} />

      <h5 className="sub-heading mt-4">
        C. 10” Cakes (for 10-12 people) € 33,-
      </h5>
      <p>Vanilla Chiffon base. (Cacao/Matcha Base + € 2,-)</p>
      <CakeList cakes={data.cakeC.edges[0].node.cakes} />

      <h5 className="sub-heading mt-4">
        D. Flower Deco High Cakes (for a small party) € 45,-
      </h5>
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
      <CakeList cakes={data.cakeD.edges[0].node.cakes} />

      <h5 className="sub-heading mt-4">E. Celebration Cakes</h5>
      <CakeList cakes={data.cakeE.edges[0].node.cakes} />
    </Layout>
  );
};

export default BirthdayCake;
