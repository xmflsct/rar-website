import React from "react";
import { useStaticQuery, graphql } from "gatsby";
import Img from "gatsby-image";

import Header from "../components/header";
import Sidebar from "../components/sidebar";
import Footer from "../components/footer";

const OurStory = ({ location }) => {
  const data = useStaticQuery(graphql`
    {
      press: allFile(
        filter: { relativeDirectory: { regex: "/(our-story)/" } }
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
  `)
  return (
    <div className="site-wrapper shop-info">
      <Header />
      <main id="site-main" className="site-main transition-fade">
        <div className="row">
          <div className="col-3">
            <Sidebar location={location} />
          </div>
          <div className="col-9">
            <h3 className="mb-3" id="press">
              Press
            </h3>
            <div className="row">
              <div className="col-6">
                <Img fluid={data.press.nodes[0].childImageSharp.fluid} />
                <p className="text-center mt-2">Newspapers</p>
              </div>
              <div className="col-6">
                <Img fluid={data.press.nodes[1].childImageSharp.fluid} />
                <p className="text-center mt-2">
                  <a
                    href="https://www.facebook.com/rdambinnenstad/posts/1352774104785170"
                    target="_blank"
                    rel="noopener noreferrer"
                    alt="Binnenstad Rotterdam"
                  >
                    Binnenstad Rotterdam #Rottergem
                  </a>
                </p>
              </div>
              <div className="col-6">
                <Img fluid={data.press.nodes[2].childImageSharp.fluid} />
                <p className="text-center mt-2">
                  <a
                    href="https://rotterdam.info/onze-blogs/blog-roundandround/"
                    target="_blank"
                    rel="noopener noreferrer"
                    alt="Rotterdam Tourist Information"
                  >
                    Rotterdam Tourist Information
                  </a>
                </p>
              </div>
              <div className="col-6">
                <Img fluid={data.press.nodes[3].childImageSharp.fluid} />
                <p className="text-center mt-2">
                  <a
                    href="https://www.debuik.nl/rotterdam/restaurant/round-round"
                    target="_blank"
                    rel="noopener noreferrer"
                    alt="De Buik van Rotterdam"
                  >
                    De Buik van Rotterdam
                  </a>
                </p>
              </div>
              <div className="col-6">
                <Img fluid={data.press.nodes[4].childImageSharp.fluid} />
                <p className="text-center mt-2">
                  <a
                    href="http://www.elleeten.nl/hotspots/ontbijt-rotterdam"
                    target="_blank"
                    rel="noopener noreferrer"
                    alt="ELLE ETEN"
                  >
                    ELLE ETEN
                  </a>
                </p>
              </div>
              <div className="col-6">
                <Img fluid={data.press.nodes[5].childImageSharp.fluid} />
                <p className="text-center mt-2">
                  <a
                    href="http://www.openrotterdam.nl/open-vlogger-dani-mastert-matcha/nieuws/item?962352"
                    target="_blank"
                    rel="noopener noreferrer"
                    alt="Open Rotterdam"
                  >
                    Open Rotterdam #matchaceremony
                  </a>
                </p>
              </div>
              <div className="col-6">
                <Img fluid={data.press.nodes[6].childImageSharp.fluid} />
                <p className="text-center mt-2">
                  <a
                    href="http://rotterdam.htspt.nl/en/roundround/"
                    target="_blank"
                    rel="noopener noreferrer"
                    alt="HTSPT Rotterdam"
                  >
                    HTSPT Rotterdam
                  </a>
                </p>
              </div>
              <div className="col-6">
                <Img fluid={data.press.nodes[7].childImageSharp.fluid} />
                <p className="text-center mt-2">
                  <a
                    href="https://www.hutspot.com/things-to-do-in-june/"
                    target="_blank"
                    rel="noopener noreferrer"
                    alt="Hutspot Tips"
                  >
                    Hutspot Tips
                  </a>
                </p>
              </div>
              <div className="col-6">
                <Img fluid={data.press.nodes[8].childImageSharp.fluid} />
                <p className="text-center mt-2">
                  <a
                    href="https://liyenfoodmoments.wordpress.com/2017/08/09/matcha-hotspots-rotterdam/"
                    target="_blank"
                    rel="noopener noreferrer"
                    alt="Liyen's food moments"
                  >
                    Liyen's food moments
                  </a>
                </p>
              </div>
              <div className="col-6">
                <Img fluid={data.press.nodes[9].childImageSharp.fluid} />
                <p className="text-center mt-2">
                  <a
                    href="http://www.hoogkwartier.nl/verhalen/bing-chao-van-roundround/"
                    target="_blank"
                    rel="noopener noreferrer"
                    alt="Hoogkwartier"
                  >
                    Hoogkwartier
                  </a>
                </p>
              </div>
              <div className="col-6">
                <Img fluid={data.press.nodes[10].childImageSharp.fluid} />
                <p className="text-center mt-2">
                  <a
                    href="http://rotterdam.htspt.nl/en/roundround/"
                    target="_blank"
                    rel="noopener noreferrer"
                    alt="Spotte by Locals"
                  >
                    Spotte by Locals
                  </a>
                </p>
              </div>
              <div className="col-6">
                <Img fluid={data.press.nodes[11].childImageSharp.fluid} />
                <p className="text-center mt-2">
                  <a
                    href="http://www.elize010.nl/hotspot-rotterdam-round-round/"
                    target="_blank"
                    rel="noopener noreferrer"
                    alt="Hotspot Rotterdam"
                  >
                    Hotspot Rotterdam
                  </a>
                </p>
              </div>
              <div className="col-6">
                <Img fluid={data.press.nodes[12].childImageSharp.fluid} />
                <p className="text-center mt-2">
                  <a
                    href="https://www.citizenm.com/citizenmag/rotterdam/places/round-round"
                    target="_blank"
                    rel="noopener noreferrer"
                    alt="CitizenMag"
                  >
                    CitizenMag
                  </a>
                </p>
              </div>
              <div className="col-6">
                <Img fluid={data.press.nodes[13].childImageSharp.fluid} />
                <p className="text-center mt-2">
                  <a
                    href="http://rotterdamiloveyou.com/design/round-round-design-cafe-round-fluffy-cakes/"
                    target="_blank"
                    rel="noopener noreferrer"
                    alt="RotterdamILoveYou"
                  >
                    RotterdamILoveYou
                  </a>
                </p>
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
