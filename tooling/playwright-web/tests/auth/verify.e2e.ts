import { faker } from "@faker-js/faker";
import { expect, test } from "@playwright/test";

import { teardownUserByEmail } from "../../utils";

const REGISTER_PAGE = "/register";
const VERIFY_PAGE = "/verify";

async function registerAndNavigateToVerify(
  page: import("@playwright/test").Page,
  email: string,
) {
  await page.goto(REGISTER_PAGE);
  await page.getByRole("textbox", { name: /email/i }).fill(email);
  await page.getByRole("button", { name: /create account/i }).click();
  await expect(page).toHaveURL(/\/verify/);
}

test("given: any user with verification cookie, should: have the correct page title", async ({
  page,
}) => {
  const email = faker.internet.email();

  await registerAndNavigateToVerify(page, email);

  await expect(page).toHaveTitle(/verify email/i);

  await teardownUserByEmail(email);
});

test("given: a user without a verification email cookie, should: redirect to login", async ({
  page,
}) => {
  await page.goto(VERIFY_PAGE);

  await expect(page).toHaveURL(/\/login/);
});

test("given: too short OTP, should: show wrong length error", async ({
  page,
}) => {
  const email = faker.internet.email();

  await registerAndNavigateToVerify(page, email);

  await page.getByRole("textbox", { name: /verification code/i }).fill("123");
  await page.getByRole("button", { name: /verify/i }).click();

  await expect(page.getByText(/code must be 6 digits/i)).toBeVisible();

  await teardownUserByEmail(email);
});

test("given: an invalid OTP, should: show invalid code error", async ({
  page,
}) => {
  const email = faker.internet.email();

  await registerAndNavigateToVerify(page, email);

  await page
    .getByRole("textbox", { name: /verification code/i })
    .fill("000000");
  await page.getByRole("button", { name: /verify/i }).click();

  await expect(page.getByText(/invalid verification code/i)).toBeVisible();

  await teardownUserByEmail(email);
});
