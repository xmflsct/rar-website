const fs = require('fs');
const path = require('path');

if (process.env.CI) {
  const vars = [
    'CONTENTFUL_SPACE',
    'CONTENTFUL_KEY_PREVIEW',
    'CONTENTFUL_PAT_PREVIEW',
    'STRIPE_KEY_ADMIN_PREVIEW',
    'STRIPE_KEY_PRIVATE_PREVIEW',
    'WEBHOOK_STRIPE_MYPARCEL_KEY_PREVIEW',
    'WEBHOOK_STRIPE_SIGNING_SECRET_PREVIEW'
  ];

  const content = vars
    .filter(key => process.env[key])
    .map(key => `${key}=${process.env[key]}`)
    .join('\n');

  fs.writeFileSync(path.resolve(process.cwd(), '.dev.vars'), content);
  console.log('Created .dev.vars from environment variables for CI.');
} else {
  console.log('Skipping .dev.vars generation (not in CI).');
}
