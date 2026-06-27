import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [
        cloudflare({
            envDir: false,
            inspectorPort: false,
            viteEnvironment: { name: "ssr" }
        }),
        reactRouter(),
        tailwindcss()
    ],
    resolve: {
        tsconfigPaths: true
    },
    server: {
        port: 5173,
        strictPort: true,
        open: false,
        watch: {
            ignored: [
                "**/.git/**",
                "**/.react-router/**",
                "**/.wrangler/**",
                "**/build/**",
                "**/node_modules/**",
                "**/playwright-report/**",
                "**/public/build/**",
                "**/test-results/**",
                "**/tmp/**"
            ]
        }
    },
    build: {
        sourcemap: false
    },
    optimizeDeps: {
        include: [
            "react",
            "react-dom",
            "react-router",
            "classnames",
            "lodash",
            "date-fns"
        ]
    }
});
