import { expect, test } from "@playwright/test";

import { auth } from "../../auth";
import { teardownUserByEmail } from "../../utils";

const LOGIN_PAGE = "/login";
const EMULATOR_EMAIL = "google-user@example.com";

test.describe("Google Login", () => {
  test("given: a registered user, should: log in with Google and be redirected to onboarding", async ({
    page,
  }) => {
    // Clean up any leftover user from previous runs
    await teardownUserByEmail(EMULATOR_EMAIL);

    const ctx = await auth.$context;
    const created = ctx.test.createUser({ email: EMULATOR_EMAIL });
    await ctx.test.saveUser(created);

    try {
      await page.goto(LOGIN_PAGE);

      await page.getByRole("button", { name: /continue with google/i }).click();

      // Select the seeded user on the emulator's user picker
      await page.getByRole("button", { name: EMULATOR_EMAIL }).click();

      await expect(page).toHaveURL(/\/onboarding/);
    } finally {
      await teardownUserByEmail(EMULATOR_EMAIL);
    }
  });
});
