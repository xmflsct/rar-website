import fs from 'fs'

if (process.env.CI) {
  const vars = [
    'CONTENTFUL_SPACE',
    'CONTENTFUL_KEY',
    'STRIPE_KEY_ADMIN',
    'STRIPE_KEY_PRIVATE',
    'WEBHOOK_STRIPE_MYPARCEL_KEY',
    'WEBHOOK_STRIPE_SIGNING_SECRET'
  ]
  let devVarsContent = ''
  for (const key of vars) {
    if (process.env[key]) {
      devVarsContent += `${key}=${process.env[key]}\n`
    }
  }
  if (devVarsContent) {
    fs.writeFileSync('.dev.vars', devVarsContent)
    console.log('Created .dev.vars from process.env for CI')
  }
}
