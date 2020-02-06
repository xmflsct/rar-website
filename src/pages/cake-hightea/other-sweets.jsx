import React from "react";
import { useStaticQuery, graphql } from "gatsby";

import Layout from "../../components/layout";
import CakeList from "../../components/cake-hightea/cake-list";

const PartyWeddingTower = ({ location }) => {
  const data = useStaticQuery(graphql`
    {
      cake: allContentfulCakesCakeList(
        filter: { contentful_id: { eq: "1FQ41FJ8eDAQKF1qXcpVSz" } }
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
      name="cake-hightea other-sweets"
      SEOtitle="Other Sweets"
      SEOkeywords={["Sweets", "Chocolate", "Rotterdam"]}
    >
      <h3 className="sub-heading mb-3">Other Sweets</h3>

      <CakeList cakes={data.cake.edges[0].node.cakes} />
    </Layout>
  );
};

export default PartyWeddingTower;
