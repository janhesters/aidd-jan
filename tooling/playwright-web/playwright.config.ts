import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;
const baseURL = isCI ? "http://localhost:1355" : "http://web.localhost:1355";

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
  webServer: {
    command: isCI
      ? "bun run --cwd ../../apps/web start:mocks"
      : "portless web bun run --cwd ../../apps/web start",
    url: baseURL,
    reuseExistingServer: !isCI,
    env: {
      NODE_ENV: "test",
      ...(isCI
        ? { PORT: "1355", BETTER_AUTH_URL: "http://localhost:1355" }
        : {}),
    },
  },
});
