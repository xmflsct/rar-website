import React from "react";
import { useStaticQuery, graphql } from "gatsby";
import Img from "gatsby-image";
import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";

import Layout from "../components/layout";
import SEO from "../components/seo";
import { Container } from "react-bootstrap";

const ShopInfo = ({ location }) => {
  const data = useStaticQuery(graphql`
    {
      main: file(relativePath: { regex: "/(shop-info/main.jpg)/" }) {
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
      instagram: file(relativePath: { regex: "/(shop-info/instagram.svg)/" }) {
        publicURL
        name
      }
      facebook: file(relativePath: { regex: "/(shop-info/facebook.svg)/" }) {
        publicURL
        name
      }
      mainMenu: file(relativePath: { regex: "/(shop-info/main_menu.pdf)/" }) {
        publicURL
        name
      }
      seasonalMenu: file(
        relativePath: { regex: "/(shop-info/seasonal_menu.pdf)/" }
      ) {
        publicURL
        name
      }
    }
  `);
  return (
    <Layout location={location} name="shop-info">
      <SEO title="Shop Info" keywords={["Round&Round", "Rotterdam"]} />

      <Img fluid={data.main.childImageSharp.fluid} />

      <Container as="h3" className="sub-heading mt-4 mb-3" id="menu">
        Menu
      </Container>
      <p>
        <a
          href={data.mainMenu.publicURL}
          target="_blank"
          rel="noopener noreferrer"
          alt="Download menu"
        >
          Check out our menu here!
        </a>
      </p>
      <p>
        <a
          href={data.seasonalMenu.publicURL}
          target="_blank"
          rel="noopener noreferrer"
          alt="Download seasonal menu"
        >
          Check out our <b>seasonal menu</b>!
        </a>
      </p>

      <Container as="h3" className="sub-heading mt-4 mb-3" id="opening-hours">
        Opening Hours
      </Container>
      <p>
        <b>Monday:</b> Closed
        <br />
        <b>Tuesday - Saturday:</b> 11:00 - 18:00 (last order 17:45)
        <br />
        <b>Sunday:</b> 12:00 - 17:00 (last order 16:45)
      </p>

      <Container as="h3" className="sub-heading mt-4 mb-3" id="contact">
        Contact
      </Container>
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2460.6118759084343!2d4.490871915785305!3d51.92279197970556!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47c433451debd72f%3A0xc4ada4e0ae53ac9c!2sRound%26Round%20Rotterdam!5e0!3m2!1sen!2sse!4v1571081880892!5m2!1sen!2sse"
        title="Google Maps"
        width="100%"
        height="400"
        frameBorder="0"
        style={{ border: 0 }}
        allowFullScreen={false}
      />
      <p className="mt-3">
        <img
          className="contact-icon"
          src={data.address.publicURL}
          alt={data.address.name}
        />
        Hoogstraat 55A, 3011PG Rotterdam
      </p>
      <p>
        <img
          className="contact-icon"
          src={data.email.publicURL}
          alt={data.email.name}
        />
        info@roundandround.nl
      </p>
      <p>
        <img
          className="contact-icon"
          src={data.phone.publicURL}
          alt={data.phone.name}
        />
        010 785 6545
      </p>
      <p>
        <img
          className="contact-icon"
          src={data.instagram.publicURL}
          alt={data.instagram.name}
        />
        <a
          href="https://www.instagram.com/roundandround_rotterdam/"
          alt="Instagram"
        >
          roundandround_rotterdam
        </a>
      </p>
      <p>
        <img
          className="contact-icon"
          src={data.facebook.publicURL}
          alt={data.facebook.name}
        />
        <a href="https://www.facebook.com/roundandround.nl/" alt="Facebook">
          Round&Round Rotterdam
        </a>
      </p>

      <Container as="h3" className="sub-heading mt-4 mb-3" id="q-a">
        Q&amp;A
      </Container>
      <Accordion defaultActiveKey="0">
        <Accordion.Toggle as={Card.Title} eventKey="0">
          Q: How do I order a whole cake?
        </Accordion.Toggle>
        <Accordion.Collapse eventKey="0">
          <Card.Body>
            <p>
              A: You can order a cake by calling us during business hours,
              sending email or sending us facebook message.
            </p>
            <p>
              Everyday we have fresh baked cakes in the shop, the flavor may
              vary. Cakes in the shop can be ordered on a first come first
              served basis.
            </p>
            <p>
              If you want to order a specific cake, we advise you to pre-order
              it. All the cakes that are shown on the Cakes & Hightea Page are
              available for pre-ordered. We advise you to order our cakes 5 days
              in advance for certainty.
            </p>
            <p>
              If you want a cake for today or tomorrow, please call us to check
              the availability.
            </p>
          </Card.Body>
        </Accordion.Collapse>

        <Accordion.Toggle as={Card.Title} eventKey="1">
          Q: I want a special pattern/ text on my cake roll, is it possible?
        </Accordion.Toggle>
        <Accordion.Collapse eventKey="1">
          <Card.Body>
            <p>
              A: It is possible! We can draw simple shapes or patterns like
              bunny, cat or tree... A short text can also be written on the cake
              roll. This extra service will cost 2 euro/per roll. Feel free to
              contact us for details.
            </p>
          </Card.Body>
        </Accordion.Collapse>

        <Accordion.Toggle as={Card.Title} eventKey="2">
          Q: Can I design my own flavour?
        </Accordion.Toggle>
        <Accordion.Collapse eventKey="2">
          <Card.Body>
            <p>
              A: Basically, you can combine any cake/cream flavour we have, then
              you have your own cake roll flavour. Need help or suggestions?
              Please call us.
            </p>
          </Card.Body>
        </Accordion.Collapse>

        <Accordion.Toggle as={Card.Title} eventKey="3">
          Q: How do I book a high-tea?
        </Accordion.Toggle>
        <Accordion.Collapse eventKey="3">
          <Card.Body>
            <p>
              A: Our high-tea menu is updated seasonally and we need time to
              prepare special items for high tea. Therefore, a reservation is
              needed. We suggest you book your high-tea 5 days in advance. Our
              high-tea can be reserved for minimal 2 people.
            </p>
            <p>
              For cancellation, please let us know at least 24 hours prior to
              your appointment.
            </p>
            <p>
              <b>
                <i>
                  If you cancel your booking less than 24 hours, 50% of the
                  total amount is required.
                </i>
              </b>
            </p>
          </Card.Body>
        </Accordion.Collapse>

        <Accordion.Toggle as={Card.Title} eventKey="4">
          Q: Do you take seat reservations?
        </Accordion.Toggle>
        <Accordion.Collapse eventKey="4">
          <Card.Body>
            <p>
              A: We only take seat reservation for a group of 6 people or more.
              If you might be late, please give us a call. Otherwise the
              reservation will be cancelled after 15 mins.
            </p>
          </Card.Body>
        </Accordion.Collapse>

        <Accordion.Toggle as={Card.Title} eventKey="5">
          Q: Can I have my whole cake roll sliced?
        </Accordion.Toggle>
        <Accordion.Collapse eventKey="5">
          <Card.Body>
            <p>
              A: Usually we do not slice entire cake roll, unless this
              requirement has been told when you pre-order the cake roll. During
              busy business hours we may have no time to slice the cake, since
              we are with limited amount of staff, and it is fun to slice the
              cake into the size you want!
            </p>
          </Card.Body>
        </Accordion.Collapse>

        <Accordion.Toggle as={Card.Title} eventKey="6">
          Q: I&apos;m interested in booking a large order of cakes. How do I go
          about it?
        </Accordion.Toggle>
        <Accordion.Collapse eventKey="6">
          <Card.Body>
            <p>
              A: For large orders, please contact us as early as possible for
              the certainty. We will give you a discount if you order 10 or more
              cakes.
            </p>
            <p>You may call us or you can email us at: info@roundandround.nl</p>
          </Card.Body>
        </Accordion.Collapse>

        <Accordion.Toggle as={Card.Title} eventKey="7">
          Q: I&apos;d like to have your cakes for a wedding or a party. How do I
          book my order?
        </Accordion.Toggle>
        <Accordion.Collapse eventKey="7">
          <Card.Body>
            <p>
              A: For wedding & Party cakes, please check here (wedding cake
              page) to see examples. The price of the cake is different in every
              case, depending on the amount of guests, and the decoration etc.
              So we suggest you give us a call or visit our shop for more
              information. Of course we can design your Wedding & Party cake
              together!
            </p>
          </Card.Body>
        </Accordion.Collapse>

        <Accordion.Toggle as={Card.Title} eventKey="8">
          Q: I am interested in featuring your cakes and sweets on our menu, How
          do I go about it?
        </Accordion.Toggle>
        <Accordion.Collapse eventKey="8">
          <Card.Body>
            <p>
              A: Please contact us by email info@roundandround.nl, and we can
              arrange an appointment for tasting. We can also design
              cakes/desserts based on your preference.
            </p>
          </Card.Body>
        </Accordion.Collapse>
      </Accordion>
    </Layout>
  );
};

export default ShopInfo;
