const siteConfig = require("./siteConfig")

module.exports = {
  siteMetadata: {
    title: siteConfig.name,
    author: siteConfig.author,
    description: siteConfig.description,
    siteUrl: siteConfig.url,
  },
  plugins: [
    `gatsby-transformer-json`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/data`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/posts`,
        name: `posts`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/assets`,
        name: `assets`,
      },
    },
    {
      resolve: `gatsby-source-instagram`,
      options: {
        username: `roundandround_rotterdam`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 920,
              linkImagesToOriginal: false,
              quality: 80,
              withWebp: true,
            },
          },
          {
            resolve: "gatsby-remark-external-links",
            options: {
              target: "_blank",
              rel: "noopener noreferrer"
            }
          },
          `gatsby-remark-smartypants`,
        ],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-postcss`,
      options: {
        postCssPlugins: [
          require("postcss-easy-import")(),
          require("postcss-custom-properties")({ preserve: false }),
          require("postcss-color-function")()
        ],
      },
    },
    {
      resolve: `gatsby-plugin-purgecss`,
      options: {
        // printRejected: true,
        // develop: true,
        whitelistPatternsChildren: [/(accordion)/, /(collapse)/, /(show)/],
      },
    },
    {
      resolve: `gatsby-plugin-google-fonts`,
      options: {
        fonts: [
          `Quicksand\:300,400,500`
        ],
      },
    },
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        // trackingId: `UA-49185184-1`,
        head: `true`,
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: siteConfig.name,
        short_name: siteConfig.shortName,
        start_url: siteConfig.prefix,
        background_color: `#ffffff`,
        theme_color: `#ffffff`,
        display: `minimal-ui`,
        icon: `static/favicon.png`,
      },
    },
    `gatsby-plugin-react-helmet`,
  ],
}
