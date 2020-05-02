const path = require(`path`)
const slugify = require(`slugify`)

exports.createPages = async ({ graphql, actions: { createPage } }) => {
  /* Biuld Cakes Page */
  const templateCakesPage = path.resolve(`src/templates/cakes-page.jsx`)
  const cakesPages = await graphql(`
    {
      cakesPages: allContentfulCakesPage {
        nodes {
          contentful_id
          heading
        }
      }
    }
  `)
  await Promise.all(
    cakesPages.data.cakesPages.nodes.map(async (node) => {
      createPage({
        path: `/${slugify(node.heading, { lower: true })}`,
        component: templateCakesPage,
        context: {
          contentful_id: node.contentful_id,
        },
      })
    })
  )
}
