import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "turso",
  out: "./drizzle",
  schema: "./src/schema.ts",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL ?? "file:local.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
