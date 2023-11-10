/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  server: './server.ts',
  ignoredRouteFiles: ['**/.*'],
  serverBuildPath: 'functions/[[path]].js',
  serverConditions: ['worker'],
  serverMainFields: ['browser', 'module', 'main'],
  serverModuleFormat: 'esm',
  serverPlatform: 'neutral',
  serverDependenciesToBundle: 'all',
  serverMinify: true,
  serverNodeBuiltinsPolyfill: {}
}
