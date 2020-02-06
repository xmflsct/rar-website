import React from "react";
import { graphql } from "gatsby";
import Img from "gatsby-image";

import { documentToReactComponents } from "@contentful/rich-text-react-renderer";

import Layout from "../components/layout";

import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

class EventTemplate extends React.Component {
  render() {
    const event = this.props.data.contentfulEventsEvent;
    const localDate = new Date(event.date).toLocaleDateString("en-UK", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric"
    });

    return (
      <Layout
        location={this.props.location}
        name={event.name}
        SEOtitle={event.name}
        SEOkeywords={["Workshop", "Event", "Rotterdam"]}
      >
        <h3 className="mb-4">{event.name}</h3>

        <Row className="mb-4">
          <Col md={3}>
            <h6>Date</h6>
            <p>{localDate}</p>
            <h6>Time</h6>
            <p>
              {new Date(event.timeStart).toLocaleTimeString("nl-NL", {
                timeStyle: "short"
              })}{" "}
              -{" "}
              {new Date(event.timeFinish).toLocaleTimeString("nl-NL", {
                timeStyle: "short"
              })}
            </p>
            {event.link ? <h6>Link</h6> : <></>}
            {event.link ? (
              <p>
                <a
                  href={event.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  alt="Facebook event link"
                >
                  Facebook Event
                </a>
              </p>
            ) : (
              <></>
            )}
          </Col>

          <Col className="md-9">
            {event.location ? (
              <iframe
                src={event.location.embedUrl.embedUrl}
                title="Google Maps"
                width="100%"
                height="300"
                frameBorder="0"
                style={{ border: 0 }}
                allowFullScreen={false}
              />
            ) : (
              <></>
            )}
          </Col>
        </Row>

        <Img fluid={event.image.fluid} className="mb-4" />

        <Row className="description">
          <Col>
            {event.description
              ? documentToReactComponents(event.description.json)
              : ""}
          </Col>
        </Row>
      </Layout>
    );
  }
}

export default EventTemplate;

export const pageQuery = graphql`
  query EventBySlug($slug: String!) {
    contentfulEventsEvent(slug: { eq: $slug }) {
      name
      date
      timeStart
      timeFinish
      link
      location {
        embedUrl {
          embedUrl
        }
      }
      image {
        fluid(maxWidth: 800) {
          ...GatsbyContentfulFluid
        }
      }
      description {
        json
      }
    }
  }
`;
