const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions

  const pageTemplate = path.resolve(`./src/templates/page.js`)
  const projectTemplate = path.resolve(`./src/templates/project.js`)
  const categoryTemplate = path.resolve(`./src/templates/category.js`)

  return graphql(
    `
      {
        allPages: allMarkdownRemark(
          filter: { fileAbsolutePath: { regex: "/pages/" } }
        ) {
          edges {
            node {
              fields {
                slug
              }
            }
          }
        }
        allProjects: allMarkdownRemark(
          sort: { fields: [frontmatter___date], order: DESC }
          filter: { fileAbsolutePath: { regex: "/projects/" } }
        ) {
          edges {
            node {
              fields {
                slug
              }
            }
          }
        }
        allCategories: allMarkdownRemark(
          filter: { fileAbsolutePath: { regex: "/(projects)/" } }
        ) {
          group(field: frontmatter___category) {
            fieldValue
          }
        }
      }
    `
  ).then(result => {
    if (result.errors) {
      throw result.errors
    }

    const pages = result.data.allPages.edges
    const projects = result.data.allProjects.edges
    const categories = result.data.allCategories.group

    pages.forEach((page, index) => {
      createPage({
        path: page.node.fields.slug,
        component: pageTemplate,
        context: {
          slug: page.node.fields.slug,
        },
      })
    })

    projects.forEach((project, index) => {
      createPage({
        path: project.node.fields.slug,
        component: projectTemplate,
        context: {
          slug: project.node.fields.slug,
        },
      })
    })

    createPage({
      path: "/",
      component: categoryTemplate,
      context: {
        category: "*",
      },
    })

    categories.forEach((category, index) => {
      createPage({
        path: category.fieldValue.replace(/\s+/g, "-").toLowerCase(),
        component: categoryTemplate,
        context: {
          category: category.fieldValue,
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
