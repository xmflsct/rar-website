import React from "react";
import { useStaticQuery, graphql } from "gatsby";

import Layout from "../components/layout";
import EventList from "../components/workshop-event/event-list";

const WorkshopEvent = ({ location }) => {
  const data = useStaticQuery(graphql`
    {
      eventsUpcoming: allContentfulEventsEvent(
        filter: { date: { gt: "2020-01-01" } }
        sort: { order: ASC, fields: date }
      ) {
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
      eventsPast: allContentfulEventsEvent(
        sort: { order: DESC, fields: date }
      ) {
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
    <Layout
      location={location}
      name="workshop-event"
      SEOtitle="Workshop &amp; Event"
      SEOkeywords={["Workshop", "Event", "Rotterdam"]}
    >
      <h3 className="sub-heading mb-3">Upcoming</h3>
      {data.eventsUpcoming.edges.map(event => {
        return Date.parse(event.node.timeStart) >= Date.now() ? (
          <EventList
            event={event}
            icon={data.date.publicURL}
            archive={false}
            key={event.node.slug}
          />
        ) : (
          <></>
        );
      })}

      <h3 className="sub-heading mb-3">Past in {new Date().getFullYear()}</h3>
      {data.eventsPast.edges.map(event => {
        const theYear = new Date(event.node.date).getFullYear();
        const thisYear = new Date().getFullYear() - 1;
        return Date.parse(event.node.timeStart) < Date.now() &&
          theYear > thisYear ? (
          <EventList
            event={event}
            icon={data.date.publicURL}
            archive={false}
            key={event.node.slug}
          />
        ) : (
          <></>
        );
      })}

      <h3 className="sub-heading mb-3">Archives</h3>
      {data.eventsPast.edges.map(event => {
        const theYear = new Date(event.node.date).getFullYear();
        const thisYear = new Date().getFullYear() - 1;
        return theYear <= thisYear ? (
          <EventList
            event={event}
            icon={data.date.publicURL}
            archive={true}
            key={event.node.slug}
          />
        ) : (
          <></>
        );
      })}
    </Layout>
  );
};

export default WorkshopEvent;
