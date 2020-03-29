require("dotenv").config({
  path: `.env.${process.env.NODE_ENV}`
})

module.exports = {
  siteMetadata: {
    title: "Round&Round Rotterdam",
    description:
      "Round&Round, Handmade Cakes&Crafts. Leading a cross-cultural lifestyle that relaxes you with an adult sense of cuteness. 跨文化＋治愈系可爱感＋手作蛋糕&杂货＝R&R生活美学",
    siteUrl: "https://roundandround.nl",
    image: "./static/favicon.png"
  },
  plugins: [
    {
      resolve: `gatsby-source-contentful`,
      options: {
        host: process.env.CONTENTFUL_HOST,
        accessToken: process.env.CONTENTFUL_KEY_GATSBY,
        spaceId: process.env.CONTENTFUL_SPACE,
        environment: process.env.CONTENTFUL_ENVIRONMENT
      }
    },
    "gatsby-transformer-json",
    {
      resolve: "gatsby-source-filesystem",
      options: {
        path: `${__dirname}/content`
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
    "gatsby-plugin-react-helmet",
    "gatsby-plugin-sitemap",
    {
      resolve: "gatsby-plugin-svgr",
      options: {
        svgo: "true"
      }
    }
  ]
}
