const siteConfig = require("./siteConfig");

module.exports = {
  siteMetadata: {
    title: siteConfig.title,
    description: siteConfig.description,
    siteUrl: siteConfig.url
  },
  plugins: [
    "gatsby-transformer-json",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: `${__dirname}/content/data`
      }
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: `${__dirname}/content/posts`,
        name: "posts"
      }
    },
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: `${__dirname}/content/assets`,
        name: "assets"
      }
    },
    {
      resolve: "gatsby-transformer-remark",
      options: {
        plugins: [
          {
            resolve: "gatsby-remark-images",
            options: {
              maxWidth: 920,
              linkImagesToOriginal: false,
              quality: 80,
              withWebp: true
            }
          },
          {
            resolve: "gatsby-remark-external-links",
            options: {
              target: "_blank",
              rel: "noopener noreferrer"
            }
          },
          "gatsby-remark-smartypants"
        ]
      }
    },
    "gatsby-transformer-sharp",
    "gatsby-plugin-sharp",
    {
      resolve: "gatsby-plugin-sass",
      options: {
        precision: 6
      }
    },
    {
      resolve: "gatsby-plugin-google-analytics",
      options: {
        trackingId: "UA-65906912-2",
        head: "true"
      }
    },
    {
      resolve: "gatsby-plugin-manifest",
      options: {
        name: siteConfig.title,
        short_name: siteConfig.shortTitle,
        background_color: "#ffffff",
        theme_color: "#ffffff",
        display: "minimal-ui",
        icon: "static/favicon.png"
      }
    },
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-sitemap",
    {
      resolve: "gatsby-plugin-svgr",
      options: {
        svgo: "true"
      }
    }
  ]
};
