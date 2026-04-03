import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { selectEmulateGoogleUser, teardownUserByEmail } from "../../utils";

const REGISTER_PAGE = "/register";
const EMULATE_GOOGLE_USER_EMAIL = "google-user@example.com";

test.describe("Google Register", () => {
  test.afterEach(async () => {
    await teardownUserByEmail(EMULATE_GOOGLE_USER_EMAIL);
  });

  test("given: an anonymous user, should: register with Google and be redirected to onboarding", async ({
    page,
  }) => {
    await page.goto(REGISTER_PAGE);

    await page
      .getByRole("button", { name: /continue with google/i })
      .click();

    await selectEmulateGoogleUser(page, EMULATE_GOOGLE_USER_EMAIL);

    await expect(page).toHaveURL(/\/onboarding/);
  });

  test("given: any user, should: have no accessibility violations", async ({
    page,
  }) => {
    await page.goto(REGISTER_PAGE);

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
