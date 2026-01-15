import type { Config } from "@react-router/dev/config";

export default {
    // Application directory
    appDirectory: "app",

    // Server-side rendering enabled for Cloudflare Workers
    ssr: true,

    // Future flags for upcoming features
    future: {
        // Vite Environment API for Cloudflare compatibility
        v8_viteEnvironmentApi: true
    }
} satisfies Config;
