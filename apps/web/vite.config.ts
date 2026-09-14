import { reactRouter } from "@react-router/dev/vite";
import transformImports from "@rolldown/plugin-transform-imports";
import tailwindcss from "@tailwindcss/vite";
import type { Plugin } from "vite";
import { defineConfig } from "vite";

function staticCacheHeaders(): Plugin {
  return {
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.startsWith("/fonts/")) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
        next();
      });
    },
    name: "static-cache-headers",
  };
}

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    transformImports({
      "@tabler/icons-react": {
        transform: "@tabler/icons-react/dist/esm/icons/{{member}}.mjs",
        preventFullImport: true,
      },
    }),
    tailwindcss(),
    reactRouter(),
    staticCacheHeaders(),
  ],
});
