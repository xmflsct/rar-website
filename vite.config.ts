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
    server: {
        port: 5173,
        strictPort: true,
        open: false
    },
    build: {
        sourcemap: false,
        commonjsOptions: {
            ignoreDynamicRequires: true
        }
    },
    optimizeDeps: {
        include: [
            "react",
            "react-dom",
            "react-router",
            "classnames",
            "lodash",
            "date-fns",
            "i18n-iso-countries"
        ]
    },
    ssr: {
        optimizeDeps: {
            include: ["i18n-iso-countries"]
        }
    }
});
