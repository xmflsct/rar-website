import { cloudflare } from "@cloudflare/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
    plugins: [
        cloudflare({ viteEnvironment: { name: "ssr" } }),
        reactRouter(),
        tailwindcss(),
        tsconfigPaths()
    ],

    // Development server configuration
    server: {
        port: 5173,
        strictPort: true,
        open: false
    },

    // Build configuration
    build: {
        // Generate source maps for production debugging
        sourcemap: true,
        // Optimize chunk splitting
        rollupOptions: {
            output: {
                manualChunks: {
                    // Vendor chunk for large dependencies
                    vendor: ["react", "react-dom", "react-router"]
                }
            }
        }
    },

    // Optimize dependency pre-bundling
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
