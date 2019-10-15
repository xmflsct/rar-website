const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions

  const workshopEventTemplate = path.resolve(`./src/templates/workshop-event.js`)

  return graphql(
    `
      {
        events: allMarkdownRemark(
          sort: { fields: [frontmatter___date], order: DESC }
          filter: { fileAbsolutePath: { regex: "/(workshop-event)/" } }
        ) {
          edges {
            node {
              fields {
                slug
              }
            }
          }
        }
      }
    `
  ).then(result => {
    if (result.errors) {
      throw result.errors
    }

    const allWorkshopEvent = result.data.events.edges

    allWorkshopEvent.forEach((workshopEvent, index) => {
      createPage({
        path: workshopEvent.node.fields.slug,
        component: workshopEventTemplate,
        context: {
          slug: workshopEvent.node.fields.slug,
        },
      })
    })

    return null
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })

    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}
