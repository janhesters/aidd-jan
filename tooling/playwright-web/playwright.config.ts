import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;
const baseURL = isCI ? "http://localhost:1355" : "https://web.localhost";

export default defineConfig({
  testDir: "./tests",
  testMatch: "*.e2e.ts",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? [["html"], ["github"]] : [["html"]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Locally, start the dev server (`bun run dev`) and emulator (`bun run emulate`) manually before running E2E tests.
  ...(isCI && {
    webServer: {
      command: "bun run --cwd ../../apps/web start:mocks",
      url: baseURL,
      reuseExistingServer: false,
      env: {
        NODE_ENV: "test",
        PORT: "1355",
        BETTER_AUTH_URL: "http://localhost:1355",
      },
    },
  }),
});
