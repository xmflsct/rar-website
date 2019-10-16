import React from "react";
import { useStaticQuery, graphql } from "gatsby";
import { Link } from "gatsby";

import OpeningHours from "./sidebar/opening-hours.js";

if (typeof window !== "undefined") {
  // eslint-disable-next-line global-require
  require("smooth-scroll")('a[href*="#"]', {
    speed: 800,
    speedAsDuration: true,
    easing: "easeInOutCubic"
  });
}

const Sidebar = ({ location }) => {
  const data = useStaticQuery(graphql`
    {
      home: file(relativePath: { regex: "/(sidebar/home.svg)/" }) {
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
    <div className="sidebar">
      <ul role="menu">
        <li className="top-nav" role="menuitem">
          <img
            src={data.home.publicURL}
            alt={"Link to " + data.home.name + "page"}
          />
          <Link to={`/`} activeClassName="active">
            Home
          </Link>
        </li>
        <li className="top-nav" role="menuitem">
          <img
            src={data.cakeHightea.publicURL}
            alt={"Link to " + data.cakeHightea.name + "page"}
          />
          <Link
            to={`/cake-hightea/signature-cake-roll`}
            activeClassName="active"
            partiallyActive={true}
          >
            Cake & Hightea
          </Link>
          {location.pathname.indexOf("/cake-hightea") > -1 && (
            <ul className="sub-nav" role="menu">
              <li>
                <Link
                  to={`/cake-hightea/signature-cake-roll`}
                  activeClassName="active"
                >
                  Signature Cake Roll
                </Link>
              </li>
              <li>
                <Link to={`/cake-hightea/round-cake`} activeClassName="active">
                  Round Cake
                </Link>
              </li>
              <li>
                <Link
                  to={`/cake-hightea/birthday-cake`}
                  activeClassName="active"
                >
                  Birthday Cake
                </Link>
              </li>
              <li>
                <Link
                  to={`/cake-hightea/forest-hightea`}
                  activeClassName="active"
                >
                  Forest Hightea
                </Link>
              </li>
              <li>
                <Link
                  to={`/cake-hightea/party-wedding-tower`}
                  activeClassName="active"
                >
                  Party/Wedding Tower
                </Link>
              </li>
              <li>
                <Link
                  to={`/cake-hightea/other-sweets`}
                  activeClassName="active"
                >
                  Other Sweets
                </Link>
              </li>
            </ul>
          )}
        </li>
        <li className="top-nav" role="menuitem">
          <img
            src={data.matcha.publicURL}
            alt={"Link to " + data.matcha.name + "page"}
          />
          <Link to={`/matcha`} activeClassName="active">
            Matcha
          </Link>
          {location.pathname.indexOf("/matcha") > -1 && (
            <ul className="sub-nav" role="menu">
              <li>
                <a href="#what-is-matcha">What is Matcha?</a>
              </li>
              <li>
                <a href="#how-is-matcha-made">How is Matcha made?</a>
              </li>
              <li>
                <a href="#our-matcha-powder">Our Matcha Powder</a>
              </li>
              <li>
                <a href="#matcha-workshop">Matcha Workshop</a>
              </li>
            </ul>
          )}
        </li>
        <li className="top-nav" role="menuitem">
          <img
            src={data.craft.publicURL}
            alt={"Link to " + data.craft.name + "page"}
          />
          <Link to={`/craft`} activeClassName="active">
            Craft
          </Link>
        </li>
        <li className="top-nav" role="menuitem">
          <img
            src={data.workshopEvent.publicURL}
            alt={"Link to " + data.workshopEvent.name + "page"}
          />
          <Link
            to={`/workshop-event`}
            activeClassName="active"
            partiallyActive={true}
          >
            Workshop & Event
          </Link>
        </li>
        <li className="top-nav" role="menuitem">
          <img
            src={data.ourStory.publicURL}
            alt={"Link to " + data.ourStory.name + "page"}
          />
          <Link to={`/our-story`} activeClassName="active">
            Our Story
          </Link>
        </li>
        <li className="top-nav" role="menuitem">
          <img
            src={data.shopInfo.publicURL}
            alt={"Link to " + data.shopInfo.name + "page"}
          />
          <Link to={`/shop-info`} activeClassName="active">
            Shop Info
          </Link>
          {location.pathname.indexOf("/shop-info") > -1 && (
            <ul className="sub-nav" role="menu">
              <li>
                <a href="#menu">Menu</a>
              </li>
              <li>
                <a href="#opening-hours">Opening Hours</a>
              </li>
              <li>
                <a href="#contact">Contact</a>
              </li>
              <li>
                <a href="#q-a">Q&A</a>
              </li>
            </ul>
          )}
        </li>
        <li className="opening-hours" role="menuitem">
          <img
            src={data.openingHours.publicURL}
            alt={data.openingHours.name + " icon"}
          />
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
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
