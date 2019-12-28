import React from "react";
import { useStaticQuery, graphql, Link } from "gatsby";
import Img from "gatsby-image";

import Carousel from "react-bootstrap/Carousel";

import Header from "../components/header";
import Sidebar from "../components/sidebar";
import Footer from "../components/footer";
import SEO from "../components/seo";
import Instagram from "../components/instagram";
import { Button, Col, Container, Row } from "react-bootstrap";

import { ReactComponent as Socials } from "../../content/assets/pages/index/social.svg";

const Index = ({ location }) => {
  const [toggleNav, setToggleNav] = React.useState(false);

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
        sort: { order: ASC, fields: name }
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
    }
  `);
  return (
    <Container
      className={`site-wrapper homepage ${toggleNav ? "site-head-open" : ""}`}
    >
      <SEO title="Welcome" keywords={["Round&Round", "Rotterdam", "matcha"]} />

      <Button
        className={`nav-burger hamburger hamburger--collapse ${
          toggleNav ? "is-active" : ""
        }`}
        variant="link"
        onClick={() => setToggleNav(!toggleNav)}
      >
        <span className="hamburger-box">
          <span className="hamburger-inner"></span>
        </span>
      </Button>

      <Header />

      <main>
        <Row className="mb-5">
          <Col lg={3}>
            <Sidebar location={location} />
          </Col>
          <Col lg={9} className="content">
            <Row className="announcement justify-content-center">
              <Col xs={11} md={9}>
                <h5 className="text-center">[Holiday Time Open Hours]</h5>
                <p className="text-center">
                  Merry Christmas 🎄&amp; Happy New Year 🧨!
                </p>
                <p>
                  <b>24 Dec  2019</b> [Order Pick Up Only]<br />
                  Note: we may have some Christmas special rolls available in the
                  shop, please call us to check.
                </p>
                <p>
                  <b>25 Dec 2019 - 3 Jan 2020</b> [Shop Closed]
                </p>
                <p>
                  <b>4 Jan 2020 onwards</b> [Open Normally]
                </p>
                <p>
                  <b>16 Jan 2020</b> [Our 4th Anniversary 🎈]
                </p>
              </Col>
            </Row>
            <Img fluid={data.main.childImageSharp.fluid} />
          </Col>
        </Row>

        <h3 className="text-center mt-4 mt-lg-0 mb-4">
          We are Matcha specialists, Cake roll lovers &amp; Culture explorers.
        </h3>

        <Row className="store-info">
          <Col lg={4}>
            <img src={data.address.publicURL} alt={data.address.name} />
            <p>
              Hoogstraat 55A
              <br />
              3011PG Rotterdam
            </p>
          </Col>
          <Col lg={4}>
            <img src={data.email.publicURL} alt={data.email.name} />
            <p>info@roundandround.nl</p>
            <img src={data.phone.publicURL} alt={data.phone.name} />
            <p>010 785 6545</p>
          </Col>
          <Col lg={4}>
            <Socials />
          </Col>
        </Row>

        <Row className="mt-4 mb-4">
          <Col xs={12}>
            <Carousel
              className="carousel"
              controls={false}
              fade
              interval={5000}
            >
              {data.carousel.edges.map(({ node }, index) => (
                <Carousel.Item key={index}>
                  <Img fluid={node.childImageSharp.fluid} />
                </Carousel.Item>
              ))}
            </Carousel>
          </Col>
        </Row>

        <Row>
          <Col lg={6} className="mb-3">
            <h3>We’re Matcha Lovers!</h3>
            <p>
              Japanese Matcha tea is a finely ground powder of shade-grown green
              tea. Matcha is rich in antioxidants and vitamins. What we do here
              in Round&amp;Round...
              <br />
              <Link to="/our-story">Read more</Link>
            </p>
            <Img fluid={data.story.childImageSharp.fluid} />
          </Col>
          <Col lg={6}>
            <h3>We’re on Instagram!</h3>
            <Instagram />
          </Col>
        </Row>
      </main>

      <Footer />
    </Container>
  );
};

export default Index;
