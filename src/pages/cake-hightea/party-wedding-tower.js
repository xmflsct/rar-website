import React from "react";
import { useStaticQuery, graphql } from "gatsby";
import { Link } from "gatsby";

import Header from "../../components/header";
import Sidebar from "../../components/sidebar";
import Footer from "../../components/footer";
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
    <div className="site-wrapper cake-hightea party-wedding-tower">
      <Header />
      <main id="site-main" className="site-main transition-fade">
        <div className="row">
          <div className="col-3">
            <Sidebar location={location} />
          </div>
          <div className="col-9">
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
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PartyWeddingTower;
