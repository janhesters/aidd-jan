import AxeBuilder from "@axe-core/playwright";
import { faker } from "@faker-js/faker";
import { expect, test } from "@playwright/test";

import { getOTPFromEmail, teardownUserByEmail } from "../../utils";

const REGISTER_PAGE = "/register";

test.describe("Register Page", () => {
  test("given: an anonymous user, should: register a new account", async ({
    page,
  }) => {
    const email = faker.internet.email();

    try {
      await page.goto(REGISTER_PAGE);

      await page.getByRole("textbox", { name: /email/i }).fill(email);
      await page.getByRole("button", { name: /create account/i }).click();

      await expect(page).toHaveURL(/\/verify/);

      const otp = await getOTPFromEmail(email);
      await page.getByRole("textbox", { name: /verification code/i }).fill(otp);
      await page.getByRole("button", { name: /verify/i }).click();

      await expect(page).toHaveURL(/\/onboarding/);
    } finally {
      await teardownUserByEmail(email);
    }
  });

  test("given: user on verify page, should: resend OTP after timer expires", async ({
    page,
  }) => {
    const email = faker.internet.email();

    try {
      // Install clock before navigation so timer manipulation works
      await page.clock.install();

      await page.goto(REGISTER_PAGE);

      await page.getByRole("textbox", { name: /email/i }).fill(email);
      await page.getByRole("button", { name: /create account/i }).click();

      await expect(page).toHaveURL(/\/verify/);

      // Advance clock in 1-second increments to properly trigger React state updates
      const RESEND_TIMER_SECONDS = 150;
      for (let i = 0; i < RESEND_TIMER_SECONDS; i++) {
        await page.clock.fastForward("00:01");
      }
      await page.clock.resume();

      const resendButton = page.getByRole("button", { name: /resend code/i });
      await resendButton.click();

      // Wait for the toast confirming the new OTP was sent and the fixture to be written
      await expect(page.getByText(/code sent/i)).toBeVisible();
      await page.waitForTimeout(1000);

      const newOtp = await getOTPFromEmail(email);
      await page.getByRole("textbox", { name: /verification code/i }).fill(newOtp);
      await page.getByRole("button", { name: /verify/i }).click();

      await expect(page).toHaveURL(/\/onboarding/);
    } finally {
      await teardownUserByEmail(email);
    }
  });

  test("given: an invalid email, should: show validation error", async ({
    page,
  }) => {
    await page.goto(REGISTER_PAGE);

    await page.getByRole("textbox", { name: /email/i }).fill("invalid");
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(
      page.getByText(/please enter a valid email address/i),
    ).toBeVisible();
  });

  test("given: any user, should: have no accessibility violations", async ({
    page,
  }) => {
    await page.goto(REGISTER_PAGE);

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });
});
