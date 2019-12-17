import React from "react";
import { Link, useStaticQuery, graphql } from "gatsby";
import Img from "gatsby-image";

import Layout from "../components/layout";
import SEO from "../components/seo";
import { Col, Container, Row } from "react-bootstrap";

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

      <Container as="h3" className="sub-heading mb-3">
        Upcoming
      </Container>
      {data.allEvents.edges
        .filter(node => {
          if (Date.parse(node.node.frontmatter.date) >= Date.now()) {
            return true;
          }
          return false;
        })
        .map(({ node }) => (
          <Row className="mb-4" key={node.index}>
            <Col md={5} xs={4}>
              <Img
                fluid={node.frontmatter.thumbnail.childImageSharp.fluid}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  paddingBottom: "100%",
                  height: "0"
                }}
              />
            </Col>
            <Col md={7} xs={8}>
              <Row className="event-header">
                <Col
                  md={2}
                  className="date-desktop"
                  style={{
                    background: `url(${data.date.publicURL}) no-repeat`,
                    backgroundSize: "contain"
                  }}
                >
                  <Container className="month">
                    {new Date(node.frontmatter.date).toLocaleString("en-UK", {
                      month: "short"
                    })}
                  </Container>
                  <Container className="day">
                    {new Date(node.frontmatter.date).toLocaleString("en-UK", {
                      day: "2-digit"
                    })}
                  </Container>
                </Col>
                <Col md={10}>
                  <Container as="h4" style={{ lineHeight: "inherit" }}>
                    <Link to={node.fields.slug}>{node.frontmatter.title}</Link>
                  </Container>
                  <Container className="date-mobile">
                    {new Date(node.frontmatter.date).toLocaleDateString(
                      "en-UK",
                      { month: "long", day: "2-digit" }
                    )}
                  </Container>
                  {node.frontmatter.time}
                </Col>
              </Row>
              <Container as="p" className="excerpt">
                {node.frontmatter.description}
              </Container>
            </Col>
          </Row>
        ))}

      <Container as="h3" className="sub-heading mt-4 mb-3">
        Past
      </Container>
      {data.allEvents.edges
        .filter(node => {
          if (Date.parse(node.node.frontmatter.date) < Date.now()) {
            return true;
          }
          return false;
        })
        .map(({ node }) => (
          <Row className="mb-4" key={node.index}>
            <Col md={5} xs={4}>
              <Img
                fluid={node.frontmatter.thumbnail.childImageSharp.fluid}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  paddingBottom: "100%",
                  height: "0"
                }}
              />
            </Col>
            <Col md={7} xs={8}>
              <Row className="event-header">
                <Col
                  md={2}
                  className="date-desktop"
                  style={{
                    background: `url(${data.date.publicURL}) no-repeat`,
                    backgroundSize: "contain"
                  }}
                >
                  <Container className="month">
                    {new Date(node.frontmatter.date).toLocaleString("en-UK", {
                      month: "short"
                    })}
                  </Container>
                  <Container className="day">
                    {new Date(node.frontmatter.date).toLocaleString("en-UK", {
                      day: "2-digit"
                    })}
                  </Container>
                </Col>
                <Col md={10}>
                  <Container as="h4" style={{ lineHeight: "inherit" }}>
                    <Link to={node.fields.slug}>{node.frontmatter.title}</Link>
                  </Container>
                  <Container className="date-mobile">
                    {new Date(node.frontmatter.date).toLocaleDateString(
                      "en-UK",
                      { month: "long", day: "2-digit" }
                    )}
                  </Container>
                  {node.frontmatter.time}
                </Col>
              </Row>
              <Container as="p" className="excerpt">
                {node.frontmatter.description}
              </Container>
            </Col>
          </Row>
        ))}
    </Layout>
  );
};

export default WorkshopEvent;
