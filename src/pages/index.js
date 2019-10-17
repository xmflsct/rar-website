import React from "react";
import { useStaticQuery, graphql } from "gatsby";
import Img from "gatsby-image";
import { Link } from "gatsby";
import Carousel from "react-bootstrap/Carousel";

import Header from "../components/header";
import Sidebar from "../components/sidebar";
import Footer from "../components/footer";
import SEO from "../components/seo";

const Index = ({ location }) => {
  const [toggleNav, setToggleNav] = React.useState(false)

  const data = useStaticQuery(graphql`
    {
      main: file(relativePath: { regex: "/(index/main.png)/" }) {
        childImageSharp {
          fluid(maxWidth: 700) {
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
              fluid(maxWidth: 920) {
                ...GatsbyImageSharpFluid_withWebp
              }
            }
          }
        }
      }
      story: file(relativePath: { regex: "/(index/story.jpg)/" }) {
        childImageSharp {
          fluid(maxWidth: 450) {
            ...GatsbyImageSharpFluid_withWebp_noBase64
          }
        }
      }
      allInstaNode(limit: 9, sort: { order: DESC, fields: timestamp }) {
        edges {
          node {
            localFile {
              childImageSharp {
                fluid(maxWidth: 150) {
                  ...GatsbyImageSharpFluid_withWebp
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

    <div className={`site-wrapper index ${toggleNav ? `site-head-open` : ``}`}>
      <SEO title="Welcome" keywords={[`Round&Round`, `Rotterdam`, `matcha`]} />

      <button
        className="nav-burger"
        href={`#`}
        onClick={() => setToggleNav(!toggleNav)}
      >
        <div
          className="hamburger hamburger--collapse"
          aria-label="Menu"
          role="button"
          aria-controls="navigation"
        >
          <div className="hamburger-box">
            <div className="hamburger-inner" />
          </div>
        </div>
      </button>

      <Header />
      <main id="site-main" className="site-main transition-fade">
        <div className="row">
          <div className="col-lg-3">
            <Sidebar location={location} />
          </div>
          <div className="main-content col-lg-9 col-md-12">
            <Img fluid={data.main.childImageSharp.fluid} />
          </div>
        </div>

        <h3 className="text-center mt-4 mt-lg-0 mb-4">
          We are Matcha specialists, Cake roll lovers & Culture explorers.
        </h3>

        <div className="row store-info">
          <div className="col-lg-4">
            <img src={data.address.publicURL} alt={data.address.name} />
            <p>
              Hoogstraat 55A
              <br />
              3011PG Rotterdam
            </p>
          </div>
          <div className="col-lg-4">
            <img src={data.email.publicURL} alt={data.email.name} />
            <p>info@roundandround.nl</p>
            <img src={data.phone.publicURL} alt={data.phone.name} />
            <p>010 785 6545</p>
          </div>
          <div className="col-lg-4">
            <img
              src={data.social.publicURL}
              alt={data.social.name}
              className="social"
            />
          </div>
        </div>

        <div className="row mt-4 mb-4">
          <Carousel className="col-12 carousel">
            {data.carousel.edges.map(({ node }, index) => (
              <Carousel.Item key={index}>
                <Img fluid={node.childImageSharp.fluid} />
              </Carousel.Item>
            ))}
          </Carousel>
        </div>

        <div className="row">
          <div className="col-lg-6 mb-3">
            <h3>We’re Matcha Lovers!</h3>
            <p>
              Japanese Matcha tea is a finely ground powder of shade-grown green
              tea. Matcha is rich in antioxidants and vitamins. What we do here
              in Round & Round...<br />
              <Link to="/our-story">Read more</Link>
            </p>
            <Img fluid={data.story.childImageSharp.fluid} />
          </div>
          <div className="col-lg-6">
            <h3>We’re on Instagram!</h3>
            <div className="row px-lg-2">
              {data.allInstaNode.edges.map(({ node }, index) => {
                return (
                  <div className="col-4 px-1 px-lg-2 mb-3">
                    <a href={"https://instagram.com/p/"+node.id} alt="Instagram post" target="_blank" rel="noopener noreferrer">
                      <Img
                        fluid={node.localFile.childImageSharp.fluid}
                        style={{width: "100%", height: "100%"}}
                        key={index}
                      />
                    </a>
                  </div>
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
