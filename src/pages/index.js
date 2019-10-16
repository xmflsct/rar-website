import React from "react";
import { useStaticQuery, graphql } from "gatsby";
import Img from "gatsby-image";
import Carousel from "react-bootstrap/Carousel";

import Header from "../components/header";
import Sidebar from "../components/sidebar";
import Footer from "../components/footer";

const Index = ({ location }) => {
  const data = useStaticQuery(graphql`
    {
      main: file(relativePath: { regex: "/(index/main.png)/" }) {
        childImageSharp {
          fluid {
            ...GatsbyImageSharpFluid_withWebp_noBase64
          }
        }
      }
      address: file(relativePath: { regex: "/(index/address.svg)/" }) {
        publicURL
        name
      }
      email: file(relativePath: { regex: "/(index/email.svg)/" }) {
        publicURL
        name
      }
      phone: file(relativePath: { regex: "/(index/phone.svg)/" }) {
        publicURL
        name
      }
      social: file(relativePath: { regex: "/(index/social.svg)/" }) {
        publicURL
        name
      }
      carousel: allFile(
        filter: { relativeDirectory: { regex: "/(index/carousel)/" } }
      ) {
        edges {
          node {
            childImageSharp {
              fluid {
                ...GatsbyImageSharpFluid_withWebp
              }
            }
          }
        }
      }
      story: file(relativePath: { regex: "/(index/story.jpg)/" }) {
        childImageSharp {
          fluid {
            ...GatsbyImageSharpFluid_withWebp_noBase64
          }
        }
      }
      allInstaNode(limit: 9, sort: { order: DESC, fields: timestamp }) {
        edges {
          node {
            localFile {
              childImageSharp {
                fixed(width: 150, height: 150) {
                  ...GatsbyImageSharpFixed
                }
              }
            }
            likes
            id
          }
        }
      }
    }
  `);
  return (
    <div className="site-wrapper index">
      <Header />
      <main id="site-main" className="site-main transition-fade">
        <div className="row">
          <div className="col-3">
            <Sidebar location={location} />
          </div>
          <div className="col-9">
            <Img fluid={data.main.childImageSharp.fluid} />
          </div>
        </div>

        <h3 className="text-center mt-4 mb-4">
          We are Matcha specialists, Cake roll lovers & Culture explorers.
        </h3>

        <div className="row store-info">
          <div className="col-4">
            <img src={data.address.publicURL} alt={data.address.name} />
            <p>
              Hoogstraat 55A
              <br />
              3011PG Rotterdam
            </p>
          </div>
          <div className="col-4">
            <img src={data.email.publicURL} alt={data.email.name} />
            <p>info@roundandround.nl</p>
            <img src={data.phone.publicURL} alt={data.phone.name} />
            <p>010 785 6545</p>
          </div>
          <div className="col-4">
            <img
              src={data.social.publicURL}
              alt={data.social.name}
              className="social"
            />
          </div>
        </div>

        <div className="row mt-4 mb-4">
          <Carousel className="col-12 carousel">
            {data.carousel.edges.map(({ node }) => (
              <Carousel.Item>
                <Img fluid={node.childImageSharp.fluid} />
              </Carousel.Item>
            ))}
          </Carousel>
        </div>

        <div className="row">
          <div className="col-6">
            <h3>We’re Matcha Lovers!</h3>
            <p>
              Japanese Matcha tea is a finely ground powder of shade-grown green
              tea. Matcha is rich in antioxidants and vitamins. What we do here
              in Round & Round...
            </p>
            <Img fluid={data.story.childImageSharp.fluid} />
          </div>
          <div className="col-6">
            <h3>We’re on Instagram!</h3>
            <div className="row">
              {data.allInstaNode.edges.map(({ node }) => {
                return (
                  <Img
                    fixed={node.localFile.childImageSharp.fixed}
                    className="col-4"
                  />
                );
              })}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
