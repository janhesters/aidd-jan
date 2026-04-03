import { reactRouter } from "@react-router/dev/vite";
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
  plugins: [tailwindcss(), reactRouter(), staticCacheHeaders()],
});
