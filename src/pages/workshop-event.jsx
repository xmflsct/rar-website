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
      allEvents: allMarkdownRemark(
        sort: { order: DESC, fields: frontmatter___date }
        filter: { frontmatter: { date: {} } }
      ) {
        edges {
          node {
            fields {
              slug
            }
            frontmatter {
              date
              time
              title
              description
              thumbnail {
                childImageSharp {
                  fluid(maxWidth: 300) {
                    ...GatsbyImageSharpFluid_withWebp
                  }
                }
              }
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
      {data.allEvents.edges
        .filter(node => {
          if (Date.parse(node.node.frontmatter.date) >= Date.now()) {
            return true;
          }
          return false;
        })
        .map(({ node }) => (
          <Row className="mb-3" key={node.index}>
            <Col md={4} lg={5}>
              <Img
                fluid={node.frontmatter.thumbnail.childImageSharp.fluid}
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
                    {new Date(node.frontmatter.date).toLocaleString("en-UK", {
                      month: "short"
                    })}
                  </span>
                  <span className="day">
                    {new Date(node.frontmatter.date).toLocaleString("en-UK", {
                      day: "2-digit"
                    })}
                  </span>
                </Col>
                <Col md={10}>
                  <h5 style={{ lineHeight: "inherit" }}>
                    <Link to={node.fields.slug}>{node.frontmatter.title}</Link>
                  </h5>
                  <span className="date-mobile">
                    {new Date(node.frontmatter.date).toLocaleDateString(
                      "en-UK",
                      { month: "long", day: "2-digit" }
                    )}
                  </span>
                  {node.frontmatter.time}
                </Col>
              </Row>
              <p className="excerpt">{node.frontmatter.description}</p>
            </Col>
          </Row>
        ))}

      <h3 className="sub-heading mb-3">Past</h3>
      {data.allEvents.edges
        .filter(node => {
          if (Date.parse(node.node.frontmatter.date) < Date.now()) {
            return true;
          }
          return false;
        })
        .map(({ node }) => (
          <Row className="mb-3" key={node.index}>
            <Col md={4} lg={5}>
              <Img
                fluid={node.frontmatter.thumbnail.childImageSharp.fluid}
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
                    {new Date(node.frontmatter.date).toLocaleString("en-UK", {
                      month: "short"
                    })}
                  </span>
                  <span className="day">
                    {new Date(node.frontmatter.date).toLocaleString("en-UK", {
                      day: "2-digit"
                    })}
                  </span>
                </Col>
                <Col md={10}>
                  <h5 style={{ lineHeight: "inherit" }}>
                    <Link to={node.fields.slug}>{node.frontmatter.title}</Link>
                  </h5>
                  <span className="date-mobile">
                    {new Date(node.frontmatter.date).toLocaleDateString(
                      "en-UK",
                      { month: "long", day: "2-digit" }
                    )}
                  </span>
                  {node.frontmatter.time}
                </Col>
              </Row>
              <p className="excerpt">{node.frontmatter.description}</p>
            </Col>
          </Row>
        ))}
    </Layout>
  );
};

export default WorkshopEvent;
