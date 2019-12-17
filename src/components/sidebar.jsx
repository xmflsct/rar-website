import React from "react";
import { useStaticQuery, graphql, Link } from "gatsby";
import { Figure, Nav } from "react-bootstrap";

import OpeningHours from "./sidebar/opening-hours";

if (typeof window !== "undefined") {
  // eslint-disable-next-line global-require
  require("smooth-scroll")('a[href*="#"]', {
    speed: 800,
    speedAsDuration: true,
    easing: "easeInOutCubic"
  });
}

const Sidebar = () => {
  const data = useStaticQuery(graphql`
    {
      index: file(relativePath: { regex: "/(sidebar/index.svg)/" }) {
        publicURL
        name
      }
      cakeHightea: file(
        relativePath: { regex: "/(sidebar/cake-hightea.svg)/" }
      ) {
        publicURL
        name
      }
      matcha: file(relativePath: { regex: "/(sidebar/matcha.svg)/" }) {
        publicURL
        name
      }
      craft: file(relativePath: { regex: "/(sidebar/craft.svg)/" }) {
        publicURL
        name
      }
      workshopEvent: file(
        relativePath: { regex: "/(sidebar/workshop-event.svg)/" }
      ) {
        publicURL
        name
      }
      ourStory: file(relativePath: { regex: "/(sidebar/our-story.svg)/" }) {
        publicURL
        name
      }
      shopInfo: file(relativePath: { regex: "/(sidebar/shop-info.svg)/" }) {
        publicURL
        name
      }
      openingHours: file(
        relativePath: { regex: "/(sidebar/opening-hours.svg)/" }
      ) {
        publicURL
        name
      }
    }
  `);
  return (
    <Nav className="flex-column ml-3">
      <Nav.Item>
        <Figure>
          <Figure.Image
            src={data.index.publicURL}
            alt={`Link to ${data.index.name}page`}
          />
        </Figure>
        <Link to="/" activeClassName="active">
          Home
        </Link>
      </Nav.Item>
      <Nav.Item>
        <Figure>
          <Figure.Image
            src={data.cakeHightea.publicURL}
            alt={`Link to ${data.cakeHightea.name}page`}
          />
        </Figure>
        <Link
          to="/cake-hightea/signature-cake-roll"
          activeClassName="active"
          partiallyActive
        >
          Cake &amp; Hightea
        </Link>
        <Nav className="flex-column sub-nav cake-hightea">
          <Nav.Item>
            <Link to="/cake-hightea/signature-cake-roll" activeClassName="active">
              Signature Cake Roll
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/cake-hightea/round-cake" activeClassName="active">
              Round Cake
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/cake-hightea/birthday-cake" activeClassName="active">
              Birthday Cake
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/cake-hightea/forest-hightea" activeClassName="active">
              Forest Hightea
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/cake-hightea/party-wedding-tower" activeClassName="active">
              Party/Wedding Tower
            </Link>
          </Nav.Item>
          <Nav.Item>
            <Link to="/cake-hightea/other-sweets" activeClassName="active">
              Other Sweets
            </Link>
          </Nav.Item>
        </Nav>
      </Nav.Item>
      <Nav.Item>
        <Figure>
          <Figure.Image
            src={data.matcha.publicURL}
            alt={`Link to ${data.matcha.name}page`}
          />
        </Figure>
        <Link
          to="/matcha"
          activeClassName="active"
        >
          Matcha
        </Link>
        <Nav className="flex-column sub-nav matcha">
          <Nav.Item>
            <a href="/matcha#what-is-matcha">What is Matcha?</a>
          </Nav.Item>
          <Nav.Item>
            <a href="/matcha#how-is-matcha-made">How is Matcha made?</a>
          </Nav.Item>
          <Nav.Item>
            <a href="/matcha#our-matcha-powder">Our Matcha Powder</a>
          </Nav.Item>
          <Nav.Item>
            <a href="/matcha#matcha-workshop">Matcha Workshop</a>
          </Nav.Item>
        </Nav>
      </Nav.Item>
      <Nav.Item>
        <Figure>
          <Figure.Image
            src={data.craft.publicURL}
            alt={`Link to ${data.craft.name}page`}
          />
        </Figure>
        <Link to="/craft" activeClassName="active">
          Craft
        </Link>
      </Nav.Item>
      <Nav.Item>
        <Figure>
          <Figure.Image
            src={data.workshopEvent.publicURL}
            alt={`Link to ${data.workshopEvent.name}page`}
          />
        </Figure>
        <Link to="/workshop-event" activeClassName="active">
          Workshop &amp; Event
        </Link>
      </Nav.Item>
      <Nav.Item>
        <Figure>
          <Figure.Image
            src={data.ourStory.publicURL}
            alt={`Link to ${data.ourStory.name}page`}
          />
        </Figure>
        <Link
          to="/our-story"
          activeClassName="active"
        >
          Our Story
        </Link>
        <Nav className="flex-column sub-nav our-story">
          <Nav.Item>
            <a href="/our-story#press">Press</a>
          </Nav.Item>
          <Nav.Item>
            <a href="/our-story#story-of-our-journey">Story of our Journey</a>
          </Nav.Item>
        </Nav>
      </Nav.Item>
      <Nav.Item>
        <Figure>
          <Figure.Image
            src={data.shopInfo.publicURL}
            alt={`Link to ${data.shopInfo.name}page`}
          />
        </Figure>
        <Link
          to="/shop-info"
          activeClassName="active"
        >
          Shop Info
        </Link>
        <Nav className="flex-column sub-nav shop-info">
          <Nav.Item>
            <a href="/shop-info#menu">Menu</a>
          </Nav.Item>
          <Nav.Item>
            <a href="/shop-info#opening-hours">Opening Hours</a>
          </Nav.Item>
          <Nav.Item>
            <a href="/shop-info#contact">Contact</a>
          </Nav.Item>
          <Nav.Item>
            <a href="/shop-info#q-a">Q&amp;A</a>
          </Nav.Item>
        </Nav>
      </Nav.Item>
      <Nav.Item className="opening-hours">
        <Figure>
          <Figure.Image
            src={data.openingHours.publicURL}
            alt={`${data.openingHours.name} icon`}
          />
        </Figure>
        <div className="opening-hours-details">
          <OpeningHours />
          <p>
            <b>Mon:</b> Closed
            <br />
            <b>Tue - Sat:</b> 11:00 - 18:00
            <br />
            (last order 17:45)
            <br />
            <b>Sun:</b> 12:00 - 17:00
            <br />
            (last order 16:45)
            <br />
          </p>
        </div>
      </Nav.Item>
    </Nav>
  );
};

export default Sidebar;
