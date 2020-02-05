import React from "react";
import { Link, useStaticQuery, graphql } from "gatsby";
import Img from "gatsby-image";

import Layout from "../components/layout";
import SEO from "../components/seo";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

const WorkshopEvent = ({ location }) => {
  const data = useStaticQuery(graphql`
    {
      events: allContentfulEventsEvent(sort: { order: DESC, fields: date }) {
        edges {
          node {
            image {
              fluid(maxWidth: 300) {
                ...GatsbyContentfulFluid
              }
            }
            date
            name
            slug
            timeStart
            timeFinish
            excerpt {
              excerpt
            }
          }
        }
      }
      date: file(relativePath: { regex: "/(workshop-event/date.svg)/" }) {
        publicURL
        name
      }
    }
  `);
  return (
    <Layout location={location} name="workshop-event">
      <SEO
        title="Workshop &amp; Event"
        keywords={["Round&Round", "Workshop", "Rotterdam"]}
      />

      <h3 className="sub-heading mb-3">Upcoming</h3>
      {data.events.edges.map(event => {
        return Date.parse(event.node.timeStart) > Date.now() ? (
          <Row className="mb-3" key={event.node.name}>
            <Col md={4} lg={5}>
              <Img
                fluid={event.node.image.fluid}
                className="mb-3"
                style={{
                  position: "relative",
                  overflow: "hidden",
                  paddingBottom: "100%",
                  height: "0"
                }}
              />
            </Col>
            <Col md={8} lg={7}>
              <Row className="event-header">
                <Col
                  md={2}
                  className="date-desktop"
                  style={{
                    background: `url(${data.date.publicURL}) no-repeat`,
                    backgroundSize: "contain"
                  }}
                >
                  <span className="month">
                    {new Date(event.node.date).toLocaleString("en-UK", {
                      month: "short"
                    })}
                  </span>
                  <span className="day">
                    {new Date(event.node.date).toLocaleString("en-UK", {
                      day: "2-digit"
                    })}
                  </span>
                </Col>
                <Col md={10}>
                  <h5 style={{ lineHeight: "inherit" }}>
                    <Link to={event.node.name}>{event.node.name}</Link>
                  </h5>
                  <span className="date-mobile">
                    {new Date(event.node.date).toLocaleDateString("en-UK", {
                      month: "long",
                      day: "2-digit"
                    })}
                  </span>
                  {event.node.date}
                </Col>
              </Row>
              <p className="excerpt">{event.node.excerpt.excerpt}</p>
            </Col>
          </Row>
        ) : (
          <></>
        );
      })}

      <h3 className="sub-heading mb-3">Past</h3>
      {data.events.edges.map(event => {
        return Date.parse(event.node.timeStart) < Date.now() ? (
          <Row className="mb-3" key={event.node.date}>
            <Col md={4} lg={5}>
              <Img
                fluid={event.node.image.fluid}
                className="mb-3"
                style={{
                  position: "relative",
                  overflow: "hidden",
                  paddingBottom: "100%",
                  height: "0"
                }}
              />
            </Col>
            <Col md={8} lg={7}>
              <Row className="event-header">
                <Col
                  md={2}
                  className="date-desktop"
                  style={{
                    background: `url(${data.date.publicURL}) no-repeat`,
                    backgroundSize: "contain"
                  }}
                >
                  <span className="month">
                    {new Date(event.node.date).toLocaleString("en-UK", {
                      month: "short"
                    })}
                  </span>
                  <span className="day">
                    {new Date(event.node.date).toLocaleString("en-UK", {
                      day: "2-digit"
                    })}
                  </span>
                </Col>
                <Col md={10}>
                  <h5 style={{ lineHeight: "inherit" }}>
                    <Link
                      to={
                        "workshop-event/" +
                        String(new Date(event.node.date).getFullYear()) +
                        "/" +
                        String(
                          (
                            "0" +
                            (new Date(event.node.date).getMonth() + 1)
                          ).slice(-2)
                        ) +
                        "/" +
                        event.node.slug
                      }
                    >
                      {event.node.name}
                    </Link>
                  </h5>
                  <span className="date-mobile">
                    {new Date(event.node.date).toLocaleDateString("en-UK", {
                      month: "long",
                      day: "2-digit"
                    })}
                  </span>
                  {new Date(event.node.timeStart).toLocaleTimeString("nl-NL", {
                    timeStyle: "short"
                  })}{" "}
                  -{" "}
                  {new Date(event.node.timeFinish).toLocaleTimeString("nl-NL", {
                    timeStyle: "short"
                  })}
                </Col>
              </Row>
              <p className="excerpt">{event.node.excerpt.excerpt}</p>
            </Col>
          </Row>
        ) : (
          <></>
        );
      })}
    </Layout>
  );
};

export default WorkshopEvent;
