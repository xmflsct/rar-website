module.exports = [{
      plugin: require('/usr/src/app/roundandround.github.io/node_modules/gatsby-remark-images/gatsby-browser.js'),
      options: {"plugins":[],"maxWidth":920,"linkImagesToOriginal":false,"quality":80,"withWebp":true},
    },{
      plugin: require('/usr/src/app/roundandround.github.io/node_modules/gatsby-plugin-google-analytics/gatsby-browser.js'),
      options: {"plugins":[],"head":"true"},
    },{
      plugin: require('/usr/src/app/roundandround.github.io/node_modules/gatsby-plugin-manifest/gatsby-browser.js'),
      options: {"plugins":[],"name":"Round&Round Rotterdam","short_name":"Round&Round","background_color":"#ffffff","theme_color":"#ffffff","display":"minimal-ui","icon":"static/favicon.png"},
    },{
      plugin: require('/usr/src/app/roundandround.github.io/node_modules/gatsby-plugin-offline/gatsby-browser.js'),
      options: {"plugins":[]},
    }]
