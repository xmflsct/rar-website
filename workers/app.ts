import { RouterContextProvider, createRequestHandler } from "react-router";
import { cloudflareContext } from "../app/utils/cloudflare";

declare global {
    interface CloudflareEnvironment {
        STRIPE_KEY_PRIVATE: string;
        STRIPE_KEY_PRIVATE_PREVIEW?: string;
        STRIPE_KEY_ADMIN: string;
        STRIPE_KEY_ADMIN_PREVIEW?: string;
        CONTENTFUL_SPACE: string;
        CONTENTFUL_KEY: string;
        CONTENTFUL_KEY_PREVIEW?: string;
        CONTENTFUL_PAT: string;
        CONTENTFUL_PAT_PREVIEW?: string;
        WEBHOOK_STRIPE_SIGNING_SECRET: string;
        WEBHOOK_STRIPE_SIGNING_SECRET_PREVIEW?: string;
        WEBHOOK_STRIPE_MYPARCEL_KEY: string;
        WEBHOOK_STRIPE_MYPARCEL_KEY_PREVIEW?: string;
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
        const routerContext = new RouterContextProvider();
        routerContext.set(cloudflareContext, { env: env as any, ctx });

        return requestHandler(request, routerContext);
    }
} satisfies ExportedHandler<CloudflareEnvironment>;
