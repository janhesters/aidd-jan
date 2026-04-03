import { describe, expect, test } from "bun:test";

import { toFormData } from "~/lib/to-form-data";
import { resendHandlers } from "~/tests/mocks/handlers/resend";
import { setupMockServerLifecycle } from "~/tests/msw-test-utils";
import {
  createTestContextProvider,
  createValidationErrorResponse,
} from "~/tests/test-utils";

import { serializeEmailCookie } from "./+/email-otp-cookie.server";
import {
  action,
  SEND_VERIFICATION_OTP_INTENT,
  SIGN_IN_EMAIL_OTP_INTENT,
} from "./verify";

const createUrl = () => `http://localhost:3000/verify`;

async function sendRequest({
  formData,
  email,
}: {
  formData: FormData;
  email?: string;
}) {
  const cookie = email ? await serializeEmailCookie(email) : undefined;
  const request = new Request(createUrl(), {
    body: formData,
    method: "POST",
    ...(cookie && { headers: { Cookie: cookie } }),
  });
  const params = {};

  return await action({
    context: await createTestContextProvider({
      params,
      request,
    }),
    params,
    request,
    unstable_pattern: "/verify",
    unstable_url: new URL(createUrl()),
  });
}

setupMockServerLifecycle(...resendHandlers);

describe("/verify route action", () => {
  test("given: a request without an email cookie, should: redirect to the login page", async () => {
    const formData = toFormData({ intent: SEND_VERIFICATION_OTP_INTENT });
    const response = (await sendRequest({ formData })) as Response;

    const redirectStatus = 302;
    expect(response.status).toEqual(redirectStatus);
    expect(response.headers.get("Location")).toBe("/login");
  });

  test("given: an invalid intent, should: return a 400 status code with an error message", async () => {
    const invalidIntent = "invalid-intent";
    const formData = toFormData({ intent: invalidIntent });

    const actual = await sendRequest({
      email: "test@example.com",
      formData,
    });

    const expected = createValidationErrorResponse(
      { intent: invalidIntent },
      { intent: ["Invalid input"] },
    );

    expect(actual).toEqual(expected);
  });

  describe(`given: ${SIGN_IN_EMAIL_OTP_INTENT} intent`, () => {
    const intent = SIGN_IN_EMAIL_OTP_INTENT;

    test.each([
      {
        body: {},
        expected: createValidationErrorResponse(
          { intent },
          { otp: ["Invalid input: expected string, received undefined"] },
        ),
        given: "no otp",
      },
      {
        body: { otp: "123" },
        expected: createValidationErrorResponse(
          { intent, otp: "123" },
          { otp: ["auth:verify.errors.wrongLength"] },
        ),
        given: "otp with wrong length (too short)",
      },
      {
        body: { otp: "1234567" },
        expected: createValidationErrorResponse(
          { intent, otp: "1234567" },
          { otp: ["auth:verify.errors.wrongLength"] },
        ),
        given: "otp with wrong length (too long)",
      },
    ])(
      "given: $given, should: return a 400 status code with an error message",
      async ({ body, expected }) => {
        const formData = toFormData({ intent, ...body });

        const actual = await sendRequest({
          email: "test@example.com",
          formData,
        });

        expect(actual).toEqual(expected);
      },
    );

    // NOTE: Happy path is tested in the E2E tests
  });

  describe(`given: ${SEND_VERIFICATION_OTP_INTENT} intent`, () => {
    // NOTE: Happy path is tested in the E2E tests
  });
});
