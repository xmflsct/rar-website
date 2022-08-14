/// <reference types="@remix-run/dev" />
/// <reference types="@remix-run/cloudflare/globals" />
/// <reference types="@cloudflare/workers-types" />

declare module '@remix-run/server-runtime' {
  interface AppLoadContext {
    ENVIRONMENT?: 'PRODUCTION' | 'PREVIEW'
    CONTENTFUL_SPACE?: string
    CONTENTFUL_KEY?: string
    STRIPE_KEY_PRIVATE?: string
    STRIPE_KEY_PUBLIC?: string
    STRIPE_KEY_ADMIN?: string
    RAR_WEBSITE?: KVNamespace
  }
}
