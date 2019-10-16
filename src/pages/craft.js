import React from "react";
import { useStaticQuery, graphql } from "gatsby";
import Img from "gatsby-image";

import Header from "../components/header";
import Sidebar from "../components/sidebar";
import Footer from "../components/footer";

const OurStory = ({ location }) => {
  const data = useStaticQuery(graphql`
    {
      craft: allFile(
        filter: { relativeDirectory: { regex: "/(craft)/" } }
        sort: { order: ASC, fields: name }
      ) {
        nodes {
          childImageSharp {
            fluid {
              ...GatsbyImageSharpFluid_withWebp
            }
          }
          name
        }
      }
    }
  `);
  return (
    <div className="site-wrapper craft">
      <Header />
      <main id="site-main" className="site-main transition-fade">
        <div className="row">
          <div className="col-3">
            <Sidebar location={location} />
          </div>
          <div className="col-9">
            <h3 className="sub-heading mb-3" id="selected">
              Selected by Round&Round
            </h3>
            <div className="row">
              <div className="col-4">
                <Img fluid={data.craft.nodes[0].childImageSharp.fluid} />
                <p className="mt-2 mb-0">
                  <b>Japanese Souveniors</b>
                </p>
                <p>Selected pieces from our Japan trip</p>
              </div>
              <div className="col-4">
                <Img fluid={data.craft.nodes[1].childImageSharp.fluid} />
                <p className="mt-2 mb-0">
                  <b>4th Market</b>
                </p>
                <p>Japanese Ceramics</p>
              </div>
              <div className="col-4">
                <Img fluid={data.craft.nodes[2].childImageSharp.fluid} />
                <p className="mt-2 mb-0">
                  <b>Stella Elhorst</b>
                </p>
                <p>Illustration Cards</p>
              </div>
              <div className="col-4">
                <Img fluid={data.craft.nodes[3].childImageSharp.fluid} />
                <p className="mt-2 mb-0">
                  <b>Donna Wilson</b>
                </p>
                <p>Home Style, Toys, Accessories & Cards</p>
              </div>
              <div className="col-4">
                <Img fluid={data.craft.nodes[4].childImageSharp.fluid} />
                <p className="mt-2 mb-0">
                  <b>Chia DNA</b>
                </p>
                <p>Illustration crafts</p>
              </div>
              <div className="col-4">
                <Img fluid={data.craft.nodes[5].childImageSharp.fluid} />
                <p className="mt-2 mb-0">
                  <b>Min-Jia Wang</b>
                </p>
                <p>Ceramics</p>
              </div>
              <div className="col-4">
                <Img fluid={data.craft.nodes[6].childImageSharp.fluid} />
                <p className="mt-2 mb-0">
                  <b>Lucia Contreras</b>
                </p>
                <p>Illustration Prints/Cards</p>
              </div>
              <div className="col-4">
                <Img fluid={data.craft.nodes[7].childImageSharp.fluid} />
                <p className="mt-2 mb-0">
                  <b>HARU HARU</b>
                </p>
                <p>Skin Care</p>
              </div>
              <div className="col-4">
                <Img fluid={data.craft.nodes[8].childImageSharp.fluid} />
                <p className="mt-2 mb-0">
                  <b>Yas Lab</b>
                </p>
                <p>Leather Key Holders</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OurStory;
