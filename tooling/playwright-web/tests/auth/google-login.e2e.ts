import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { selectEmulateGoogleUser, teardownUserByEmail } from "../../utils";

const LOGIN_PAGE = "/login";
const EMULATE_GOOGLE_USER_EMAIL = "google-user@example.com";

test.describe("Google Login", () => {
  test.afterEach(async () => {
    await teardownUserByEmail(EMULATE_GOOGLE_USER_EMAIL);
  });

  test("given: an anonymous user, should: log in with Google and be redirected to onboarding", async ({
    page,
  }) => {
    await page.goto(LOGIN_PAGE);

    await page
      .getByRole("button", { name: /continue with google/i })
      .click();

    await selectEmulateGoogleUser(page, EMULATE_GOOGLE_USER_EMAIL);

    await expect(page).toHaveURL(/\/onboarding/);
  });

  test("given: any user, should: have no accessibility violations", async ({
    page,
  }) => {
    await page.goto(LOGIN_PAGE);

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
