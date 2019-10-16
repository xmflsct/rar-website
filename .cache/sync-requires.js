const { hot } = require("react-hot-loader/root")

// prefer default export if available
const preferDefault = m => m && m.default || m


exports.components = {
  "component---node-modules-gatsby-plugin-offline-app-shell-js": hot(preferDefault(require("/usr/src/app/roundandround.github.io/node_modules/gatsby-plugin-offline/app-shell.js"))),
  "component---src-templates-workshop-event-js": hot(preferDefault(require("/usr/src/app/roundandround.github.io/src/templates/workshop-event.js"))),
  "component---src-pages-cake-hightea-birthday-cake-js": hot(preferDefault(require("/usr/src/app/roundandround.github.io/src/pages/cake-hightea/birthday-cake.js"))),
  "component---src-pages-cake-hightea-forest-hightea-js": hot(preferDefault(require("/usr/src/app/roundandround.github.io/src/pages/cake-hightea/forest-hightea.js"))),
  "component---src-pages-cake-hightea-other-sweets-js": hot(preferDefault(require("/usr/src/app/roundandround.github.io/src/pages/cake-hightea/other-sweets.js"))),
  "component---src-pages-cake-hightea-party-wedding-tower-js": hot(preferDefault(require("/usr/src/app/roundandround.github.io/src/pages/cake-hightea/party-wedding-tower.js"))),
  "component---src-pages-cake-hightea-round-cake-js": hot(preferDefault(require("/usr/src/app/roundandround.github.io/src/pages/cake-hightea/round-cake.js"))),
  "component---src-pages-cake-hightea-signature-cake-roll-js": hot(preferDefault(require("/usr/src/app/roundandround.github.io/src/pages/cake-hightea/signature-cake-roll.js"))),
  "component---src-pages-craft-js": hot(preferDefault(require("/usr/src/app/roundandround.github.io/src/pages/craft.js"))),
  "component---src-pages-index-js": hot(preferDefault(require("/usr/src/app/roundandround.github.io/src/pages/index.js"))),
  "component---src-pages-matcha-js": hot(preferDefault(require("/usr/src/app/roundandround.github.io/src/pages/matcha.js"))),
  "component---src-pages-our-story-js": hot(preferDefault(require("/usr/src/app/roundandround.github.io/src/pages/our-story.js"))),
  "component---src-pages-shop-info-js": hot(preferDefault(require("/usr/src/app/roundandround.github.io/src/pages/shop-info.js"))),
  "component---src-pages-workshop-event-js": hot(preferDefault(require("/usr/src/app/roundandround.github.io/src/pages/workshop-event.js")))
}

