import React from "react";
import { useStaticQuery, graphql } from "gatsby";
import { Link } from "gatsby";

import Layout from "../../components/layout";
import CakeList from "../../components/cake-hightea/cake-list";

const PartyWeddingTower = ({ location }) => {
  const data = useStaticQuery(graphql`
    {
      allMarkdownRemark(
        filter: {
          fileAbsolutePath: { regex: "/(cake-hightea/party-wedding-tower)/" }
        }
        sort: { order: ASC, fields: frontmatter___cake_hightea___order }
      ) {
        edges {
          node {
            frontmatter {
              cake_hightea {
                name
                order
                category
                description
                price {
                  piece
                  whole
                }
              }
              thumbnail {
                childImageSharp {
                  fluid {
                    ...GatsbyImageSharpFluid_withWebp
                  }
                }
              }
            }
          }
        }
      }
    }
  `);
  return (
    <Layout location={location} name="party-wedding-tower">
      <h3 className="sub-heading mb-3">Party/Wedding Tower</h3>

      <p>
        How to order a cake roll tower for your wedding or party?
        <br />
        Please <Link to="/shop-info#contact">contact us</Link> for
        possibilities.
      </p>

      <div className="row">
        {data.allMarkdownRemark.edges.map(({ node }) => (
          <CakeList node={node} />
        ))}
      </div>
    </Layout>
  );
};

export default PartyWeddingTower;
