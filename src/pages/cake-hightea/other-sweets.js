import React from "react";
import { useStaticQuery, graphql } from "gatsby";

import Layout from "../../components/layout";
import SEO from "../../components/seo";
import CakeList from "../../components/cake-hightea/cake-list";

const PartyWeddingTower = ({ location }) => {
  const data = useStaticQuery(graphql`
    {
      allMarkdownRemark(
        filter: { fileAbsolutePath: { regex: "/(cake-hightea/other-sweets)/" } }
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
    <Layout location={location} name="other-sweets">
      <SEO title="Other Sweets" keywords={[`Round&Round`, `Rotterdam`]} />

      <h3 className="sub-heading mb-3">Other Sweets</h3>

      <div className="row">
        {data.allMarkdownRemark.edges.map(({ node }) => (
          <CakeList node={node} />
        ))}
      </div>
    </Layout>
  );
};

export default PartyWeddingTower;
