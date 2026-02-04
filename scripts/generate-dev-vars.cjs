const fs = require('fs');
const path = require('path');

if (process.env.CI) {
  const vars = [
    // CONTENTFUL_SPACE is provided by wrangler.jsonc or can be overridden here
    // But since it's a public var, we might not need to force it unless the secret is provided.
    // However, the test runner seems to need it in process.env or .dev.vars if we are mocking the environment.
    // If it's empty in secrets, let's provide the default from wrangler.jsonc or a fallback.
    'CONTENTFUL_SPACE',
    'CONTENTFUL_KEY',
    'CONTENTFUL_PAT',
    'STRIPE_KEY_ADMIN',
    'STRIPE_KEY_PRIVATE',
    'WEBHOOK_STRIPE_MYPARCEL_KEY',
    'WEBHOOK_STRIPE_SIGNING_SECRET'
  ];

  const content = vars
    .map(key => {
        if (process.env[key]) {
            return `${key}=${process.env[key]}`;
        }
        // Fallback for CONTENTFUL_SPACE if not in secrets (it is not a secret, usually)
        if (key === 'CONTENTFUL_SPACE') {
             return `${key}=u0x1afixkalo`;
        }
        return null;
    })
    .filter(Boolean)
    .join('\n');

  fs.writeFileSync(path.resolve(process.cwd(), '.dev.vars'), content);
  console.log('Created .dev.vars from environment variables for CI.');
} else {
  console.log('Skipping .dev.vars generation (not in CI).');
}
