import { expect, test } from "@playwright/test";

import { teardownUserByEmail } from "../../utils";

const REGISTER_PAGE = "/register";
const EMULATOR_EMAIL = "google-user@example.com";

test.describe("Google Register", () => {
  test("given: an anonymous user, should: register with Google and be redirected to onboarding", async ({
    page,
  }) => {
    try {
      await page.goto(REGISTER_PAGE);

      await page.getByRole("button", { name: /continue with google/i }).click();

      // Select the seeded user on the emulator's user picker
      await page.getByRole("button", { name: EMULATOR_EMAIL }).click();

      await expect(page).toHaveURL(/\/onboarding/);
    } finally {
      await teardownUserByEmail(EMULATOR_EMAIL);
    }
  });
});
