import React from "react";
import { useStaticQuery, graphql } from "gatsby";
import Img from "gatsby-image";
import { Link } from "gatsby";

import Layout from "../components/layout";
import SEO from "../components/seo";

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
      <SEO title="Workshop & Event" keywords={[`Round&Round`, `Workshop`, `Rotterdam`]} />

      <h3 className="sub-heading mb-3" id="matcha-lovers">
        Upcoming
      </h3>
      {data.allEvents.edges
        .filter(function(node) {
          if (Date.parse(node.node.frontmatter.date) >= Date.now()) {
            return true;
          } else {
            return false;
          }
        })
        .map(({ node }, index) => (
          <div className="row mb-4" key={index}>
            <div className="col-5">
              <Img
                fluid={node.frontmatter.thumbnail.childImageSharp.fluid}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  paddingBottom: "100%",
                  height: "0"
                }}
              />
            </div>
            <div className="col-7">
              <div className="row event-header">
                <div
                  className="col-2 date"
                  style={{
                    background: "url(" + data.date.publicURL + ") no-repeat",
                    backgroundSize: "contain"
                  }}
                >
                  <div className="month">
                    {new Date(node.frontmatter.date).toLocaleDateString(
                      "en-UK",
                      { month: "short" }
                    )}
                  </div>
                  <div className="day">
                    {new Date(node.frontmatter.date).toLocaleDateString(
                      "en-UK",
                      { day: "2-digit" }
                    )}
                  </div>
                </div>
                <div className="col-10">
                  <h4 style={{ lineHeight: "inherit" }}>
                    <Link to={node.fields.slug}>{node.frontmatter.title}</Link>
                  </h4>
                  {node.frontmatter.time}
                </div>
              </div>
              <p>{node.frontmatter.description}</p>
            </div>
          </div>
        ))}

      <h3 className="sub-heading mt-4 mb-3" id="matcha-lovers">
        Past
      </h3>
      {data.allEvents.edges
        .filter(function(node) {
          if (Date.parse(node.node.frontmatter.date) < Date.now()) {
            return true;
          } else {
            return false;
          }
        })
        .map(({ node }, index) => (
          <div className="row mb-4" key={index}>
            <div className="col-5">
              <Img
                fluid={node.frontmatter.thumbnail.childImageSharp.fluid}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  paddingBottom: "100%",
                  height: "0"
                }}
              />
            </div>
            <div className="col-7">
              <div className="row event-header">
                <div
                  className="col-2 date"
                  style={{
                    background: "url(" + data.date.publicURL + ") no-repeat",
                    backgroundSize: "contain"
                  }}
                >
                  <div className="month">
                    {new Date(node.frontmatter.date).toLocaleString("en-UK", {
                      month: "short"
                    })}
                  </div>
                  <div className="day">
                    {new Date(node.frontmatter.date).toLocaleString("en-UK", {
                      day: "2-digit"
                    })}
                  </div>
                </div>
                <div className="col-10">
                  <h4 style={{ lineHeight: "inherit" }}>
                    <Link to={node.fields.slug}>{node.frontmatter.title}</Link>
                  </h4>
                  {node.frontmatter.time}
                </div>
              </div>
              <p>{node.frontmatter.description}</p>
            </div>
          </div>
        ))}
    </Layout>
  );
};

export default WorkshopEvent;
