import React from "react";
import { useStaticQuery, graphql } from "gatsby";

import Header from "../../components/header";
import Sidebar from "../../components/sidebar";
import Footer from "../../components/footer";
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
    <div className="site-wrapper cake-hightea other-sweets">
      <Header />
      <main id="site-main" className="site-main transition-fade">
        <div className="row">
          <div className="col-3">
            <Sidebar location={location} />
          </div>
          <div className="col-9">
            <h3 className="sub-heading mb-3">Other Sweets</h3>

            <div className="row">
              {data.allMarkdownRemark.edges.map(({ node }) => (
                <CakeList node={node} />
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PartyWeddingTower;
