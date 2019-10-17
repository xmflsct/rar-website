import React from "react";
import { useStaticQuery, graphql } from "gatsby";

const OpeningHours = () => {
  const data = useStaticQuery(graphql`
    {
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
  `);
  setTimeout(function() {
    if (
      Date.now() >= Date.parse(data.closedDates.start) &&
      Date.now() <= Date.parse(data.closedDates.end)
    ) {
      return <span className="shop-badge shop-close">Closed for holiday</span>;
    } else {
      if (data.openingHours.nodes[new Date().getDay()].open) {
        var currentTime = new Date();
        var almostOpen = new Date().setHours(
          data.openingHours.nodes[new Date().getDay()].hours[0].almost_open[0]
            .hour,
          data.openingHours.nodes[new Date().getDay()].hours[0].almost_open[0]
            .minute,
          0
        );
        var open = new Date().setHours(
          data.openingHours.nodes[new Date().getDay()].hours[0].open[0].hour,
          data.openingHours.nodes[new Date().getDay()].hours[0].open[0].minute,
          0
        );
        var close = new Date().setHours(
          data.openingHours.nodes[new Date().getDay()].hours[0].close[0].hour,
          data.openingHours.nodes[new Date().getDay()].hours[0].close[0].minute,
          0
        );
        var lastOrder = new Date().setHours(
          data.openingHours.nodes[new Date().getDay()].hours[0].last_order[0]
            .hour,
          data.openingHours.nodes[new Date().getDay()].hours[0].last_order[0]
            .minute,
          0
        );
        if (currentTime >= almostOpen && currentTime < open) {
          return <span className="shop-badge shop-open-soon">Open soon</span>;
        } else if (currentTime >= open && currentTime < lastOrder) {
          return <span className="shop-badge shop-open">Open now</span>;
        } else if (currentTime >= lastOrder && currentTime < close) {
          return <span className="shop-badge shop-last-order">Last order</span>;
        } else {
          return <span className="shop-badge shop-close">Closed</span>;
        }
      } else {
        return <span className="shop-badge shop-close">Closed for today</span>;
      }
    }
  }, 500);
};

export default OpeningHours;
