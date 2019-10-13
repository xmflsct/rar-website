const urljoin = require("url-join")
const siteConfig = require("./siteConfig")

module.exports = {
  siteMetadata: {
    title: siteConfig.name,
    author: siteConfig.author,
    description: siteConfig.description,
    siteUrl: urljoin(siteConfig.url, siteConfig.prefix),
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/pages`,
        name: `pages`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/projects`,
        name: `projects`,
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
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 1280,
              linkImagesToOriginal: false,
              wrapperStyle: `margin: 7vw 0;`,
              quality: 80,
              withWebp: true,
            },
          },
          {
            resolve: "gatsby-remark-embed-video",
            options: {
              width: 1280,
              ratio: 1.77,
              related: false,
              noIframeBorder: true,
              urlOverrides: [
                {
                  id: 'youtube',
                  embedURL: (videoId) => `https://www.youtube-nocookie.com/embed/${videoId}`,
                }
              ]
            }
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          {
            resolve: "gatsby-remark-custom-blocks",
            options: {
              blocks: {
                kgWidthAvatar: {
                  classes: "kg-card kg-width-avatar"
                },
                kgWidthWide: {
                  classes: "kg-card kg-image-card kg-width-wide",
                },
                kgWidthFull: {
                  classes: "kg-card kg-image-card kg-width-full",
                },
              },
            },
          },
          {
            resolve: "gatsby-remark-external-links",
            options: {
              target: "_blank",
              rel: "noopener noreferrer"
            }
          },
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
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
        printRejected: true,
        develop: true,
        whitelistPatternsChildren: [/(kg)/, /(dark)/],
      },
    },
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-49185184-1`,
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
    {
      resolve: 'gatsby-plugin-use-dark-mode',
      options: {
        classNameDark: 'dark-mode',
        classNameLight: 'light-mode',
        storageKey: null,
        minify: true,
      },
    },
    `gatsby-plugin-offline`,
    `gatsby-plugin-react-helmet`,
  ],
}
