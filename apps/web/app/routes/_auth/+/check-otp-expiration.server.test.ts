import { describe, expect, onTestFinished, test } from "bun:test";

import { faker } from "@faker-js/faker";

import { auth } from "~/lib/auth.server";

import { getIsOTPExpired } from "./check-otp-expiration.server";

async function setup() {
  const ctx = await auth.$context;
  const email = faker.internet.email();
  const user = ctx.test.createUser({ email });
  await ctx.test.saveUser(user);

  onTestFinished(async () => {
    await ctx.test.deleteUser(user.id);
  });

  return { email, user };
}

describe("getIsOTPExpired()", () => {
  test("given: no verification record exists, should: return true", async () => {
    const actual = await getIsOTPExpired(faker.internet.email());
    const expected = true;

    expect(actual).toEqual(expected);
  });

  test("given: a fresh OTP was sent, should: return false", async () => {
    const { email } = await setup();
    await auth.api.sendVerificationOTP({
      body: { email, type: "sign-in" },
    });

    const actual = await getIsOTPExpired(email);
    const expected = false;

    expect(actual).toEqual(expected);
  });

  test("given: an email with mixed case, should: find the verification record", async () => {
    const { email } = await setup();
    await auth.api.sendVerificationOTP({
      body: { email, type: "sign-in" },
    });

    const actual = await getIsOTPExpired(email.toUpperCase());
    const expected = false;

    expect(actual).toEqual(expected);
  });
});
