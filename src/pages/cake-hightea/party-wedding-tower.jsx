import React from "react";
import { useStaticQuery, graphql, Link } from "gatsby";

import Layout from "../../components/layout";
import SEO from "../../components/seo";
import CakeList from "../../components/cake-hightea/cake-list";

const PartyWeddingTower = ({ location }) => {
  const data = useStaticQuery(graphql`
    {
      cake: allContentfulCakesCakeList(
        filter: { contentful_id: { eq: "3GqEPe3fZXWCAj3bvYegy" } }
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
    <Layout location={location} name="cake-hightea party-wedding-tower">
      <SEO
        title="Party/Wedding Tower"
        keywords={["Round&Round", "Rotterdam"]}
      />

      <h3 className="sub-heading mb-3">Party/Wedding Tower</h3>

      <p>
        How to order a cake roll tower for your wedding or party?
        <br />
        Please <Link to="/shop-info#contact">contact us</Link> for
        possibilities.
      </p>

      <CakeList cakes={data.cake.edges[0].node.cakes} />
    </Layout>
  );
};

export default PartyWeddingTower;
