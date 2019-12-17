import React from "react";
import { StaticQuery, graphql } from "gatsby";
import { Container } from "react-bootstrap";

class OpeningHours extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isClient: false };
  }

  componentDidMount() {
    this.setState({ isClient: true });
  }

  render() {
    if (
      Date.now() >= Date.parse(this.props.closedDates.start) &&
      Date.now() <= Date.parse(this.props.closedDates.end)
    ) {
      return (
        <Container
          as="span"
          className="shop-badge shop-close"
          key={this.state.isClient}
        >
          Closed for holiday
        </Container>
      );
    }
    if (this.props.openingHours.nodes[new Date().getDay()].open) {
      var currentTime = new Date();
      var almostOpen = new Date().setHours(
        this.props.openingHours.nodes[new Date().getDay()].hours[0]
          .almost_open[0].hour,
        this.props.openingHours.nodes[new Date().getDay()].hours[0]
          .almost_open[0].minute,
        0
      );
      var open = new Date().setHours(
        this.props.openingHours.nodes[new Date().getDay()].hours[0].open[0]
          .hour,
        this.props.openingHours.nodes[new Date().getDay()].hours[0].open[0]
          .minute,
        0
      );
      var close = new Date().setHours(
        this.props.openingHours.nodes[new Date().getDay()].hours[0].close[0]
          .hour,
        this.props.openingHours.nodes[new Date().getDay()].hours[0].close[0]
          .minute,
        0
      );
      var lastOrder = new Date().setHours(
        this.props.openingHours.nodes[new Date().getDay()].hours[0]
          .last_order[0].hour,
        this.props.openingHours.nodes[new Date().getDay()].hours[0]
          .last_order[0].minute,
        0
      );
      if (currentTime >= almostOpen && currentTime < open) {
        return (
          <Container
            as="span"
            className="shop-badge shop-open-soon"
            key={this.state.isClient}
          >
            Open soon
          </Container>
        );
      }
      if (currentTime >= open && currentTime < lastOrder) {
        return (
          <Container
            as="span"
            className="shop-badge shop-open"
            key={this.state.isClient}
          >
            Open now
          </Container>
        );
      } else if (currentTime >= lastOrder && currentTime < close) {
        return (
          <Container
            as="span"
            className="shop-badge shop-last-order"
            key={this.state.isClient}
          >
            Last order
          </Container>
        );
      } else {
        return (
          <Container
            as="span"
            className="shop-badge shop-close"
            key={this.state.isClient}
          >
            Closed
          </Container>
        );
      }
    } else {
      return (
        <Container
          as="span"
          className="shop-badge shop-close"
          key={this.state.isClient}
        >
          Closed for today
        </Container>
      );
    }
  }
}

export default props => (
  <StaticQuery
    query={graphql`
      query {
        openingHours: allOpeningHoursJson(sort: { order: ASC, fields: day }) {
          nodes {
            day
            open
            hours {
              almost_open {
                hour
                minute
              }
              open {
                hour
                minute
              }
              close {
                hour
                minute
              }
              last_order {
                hour
                minute
              }
            }
          }
        }
        closedDates: dataJson {
          start
          end
        }
      }
    `}
    render={({ openingHours, closedDates }) => (
      <OpeningHours
        openingHours={openingHours}
        closedDates={closedDates}
        {...props}
      />
    )}
  />
);
