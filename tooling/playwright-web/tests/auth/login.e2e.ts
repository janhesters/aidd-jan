import AxeBuilder from "@axe-core/playwright";
import { faker } from "@faker-js/faker";
import { expect, test } from "@playwright/test";

import { auth } from "../../auth";
import { getOTPFromEmail, teardownUser } from "../../utils";

const LOGIN_PAGE = "/login";

test("given: any user, should: have the correct page title", async ({
  page,
}) => {
  await page.goto(LOGIN_PAGE);

  await expect(page).toHaveTitle(/sign in/i);
});

test("given: an invalid email, should: show validation error", async ({
  page,
}) => {
  await page.goto(LOGIN_PAGE);

  await page.getByRole("textbox", { name: /email/i }).fill("invalid");
  await page.getByRole("button", { name: /sign in with email/i }).click();

  await expect(
    page.getByText(/please enter a valid email address/i),
  ).toBeVisible();
});

test("given: a registered user, should: log in and be redirected to onboarding", async ({
  page,
}) => {
  const ctx = await auth.$context;
  const email = faker.internet.email();
  const created = ctx.test.createUser({ email });
  await ctx.test.saveUser(created);

  try {
    await page.goto(LOGIN_PAGE);

    await page.getByRole("textbox", { name: /email/i }).fill(email);
    await page.getByRole("button", { name: /sign in with email/i }).click();

    await expect(page).toHaveURL(/\/verify/);

    const otp = await getOTPFromEmail(email);
    await page.getByRole("textbox", { name: /verification code/i }).fill(otp);
    await page.getByRole("button", { name: /verify/i }).click();

    await expect(page).toHaveURL(/\/onboarding/);
  } finally {
    await teardownUser(created.id);
  }
});

test("given: any user, should: have no accessibility violations", async ({
  page,
}) => {
  await page.goto(LOGIN_PAGE);

  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
