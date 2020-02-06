import React from "react";
import { useStaticQuery, graphql, Link } from "gatsby";

import Layout from "../../components/layout";
import CakeList from "../../components/cake-hightea/cake-list";

const RoundCake = ({ location }) => {
  const data = useStaticQuery(graphql`
    {
      cake: allContentfulCakesCakeList(
        filter: { contentful_id: { eq: "4Ta1Xennm5pPPwV0luMTTS" } }
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
      name="cake-hightea round-cake"
      SEOtitle="Round Cake"
      SEOkeywords={["Round cake", "Rotterdam"]}
    >
      <h3 className="sub-heading mb-3">Round Cake</h3>

      <p>
        We also have sliced round cakes everyday in shop. The entire round cakes
        below can be pre-ordered by{" "}
        <a href="mailto:info@roundandround.nl">sending us an email</a>,{" "}
        <a href="tel:0031107856545">calling us</a>
        or{" "}
        <a
          href="https://www.facebook.com/roundandround.nl/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Facebook messaging us
        </a>
        . Please place your order 5 days in advance for certainty.
      </p>
      <p>
        For further information, please read our{" "}
        <Link to="/shop-info#q-a">Q&amp;A</Link>.{" "}
      </p>

      <CakeList cakes={data.cake.edges[0].node.cakes} />
    </Layout>
  );
};

export default RoundCake;
