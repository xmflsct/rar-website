import { createRequestHandler } from "react-router";

declare global {
    interface CloudflareEnvironment {
        ENVIRONMENT: string;
        STRIPE_KEY_PUBLIC: string;
        STRIPE_KEY_PRIVATE: string;
        STRIPE_KEY_ADMIN: string;
        CONTENTFUL_SPACE: string;
        CONTENTFUL_KEY: string;
        CONTENTFUL_PAT: string;
        WEBHOOK_STRIPE_SIGNING_SECRET: string;
        WEBHOOK_STRIPE_MYPARCEL_KEY: string;
        RAR_WEBSITE?: KVNamespace;
        RAR_WEBSITE_PREVIEW?: KVNamespace;
    }
}

const requestHandler = createRequestHandler(
    () => import("virtual:react-router/server-build"),
    import.meta.env.MODE
);

export default {
    async fetch(request, env, ctx) {
        return requestHandler(request, {
            cloudflare: { env, ctx }
        });
    }
} satisfies ExportedHandler<CloudflareEnvironment>;
