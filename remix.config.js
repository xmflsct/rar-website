/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  server: './server.ts',
  ignoredRouteFiles: ['**/.*'],
  serverBuildPath: 'build/server/index.js',
  serverConditions: ['worker'],
  serverMainFields: ['browser', 'module', 'main'],
  serverModuleFormat: 'esm',
  serverPlatform: 'neutral',
  serverDependenciesToBundle: 'all',
  serverMinify: true,
  serverNodeBuiltinsPolyfill: {},
  future: {
    v3_fetcherPersist: true,
    v3_lazyRouteDiscovery: true,
    v3_relativeSplatPath: true,
    v3_singleFetch: true,
    v3_throwAbortReason: true
  }
}
