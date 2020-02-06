import React from "react";
import { Col, Row } from "react-bootstrap";
import { Link } from "gatsby";
import Img from "gatsby-image";

const EventList = ({ event, icon, archive }) => (
  <Row className={`mb-3 ${archive ? "archive" : ""}`} key={event.node.date}>
    {archive ? (
      <></>
    ) : (
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
    )}

    <Col md={archive ? 12 : 8} lg={archive ? 12 : 7}>
      {archive ? (
        <Row className="event-header">
          <Col md={12}>
            <h5 style={{ lineHeight: "inherit" }}>
              <Link
                to={
                  "workshop-event/" +
                  String(new Date(event.node.date).getFullYear()) +
                  "/" +
                  String(
                    ("0" + (new Date(event.node.date).getMonth() + 1)).slice(-2)
                  ) +
                  "/" +
                  event.node.slug
                }
              >
                {event.node.name}
              </Link>
            </h5>
            <span>
              {new Date(event.node.date).toLocaleDateString("en-UK", {
                year: "numeric",
                month: "long",
                day: "2-digit"
              })}
            </span>{" "}
            at{" "}
            {new Date(event.node.timeStart).toLocaleTimeString("nl-NL", {
              timeStyle: "short"
            })}
            -{" "}
            {new Date(event.node.timeFinish).toLocaleTimeString("nl-NL", {
              timeStyle: "short"
            })}
          </Col>
        </Row>
      ) : (
        <Row className="event-header">
          <Col
            md={2}
            className="date-desktop"
            style={{
              background: `url(${icon}) no-repeat`,
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
                    ("0" + (new Date(event.node.date).getMonth() + 1)).slice(-2)
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
      )}

      {event.node.excerpt ? (
        <p className="excerpt">{event.node.excerpt.excerpt}</p>
      ) : (
        <></>
      )}
    </Col>
  </Row>
);

export default EventList;
