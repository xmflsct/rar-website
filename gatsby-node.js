const path = require("path");

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions;

  return graphql(
    `
      {
        events: allContentfulEventsEvent(sort: { order: DESC, fields: date }) {
          edges {
            node {
              date
              slug
            }
          }
        }
      }
    `
  ).then(result => {
    if (result.errors) {
      throw result.errors;
    }

    const eventTemplate = path.resolve("src/templates/workshop-event.jsx");

    result.data.events.edges.forEach(event => {
      eventYear = new Date(event.node.date).getFullYear();
      eventMonth = ("0" + (new Date(event.node.date).getMonth() + 1)).slice(-2);
      eventSlug =
        "workshop-event/" +
        eventYear +
        "/" +
        eventMonth +
        "/" +
        event.node.slug;

      createPage({
        path: eventSlug,
        component: eventTemplate,
        context: {
          slug: event.node.slug
        }
      });
    });

    return null;
  });
};
