import { describe, expect, test } from "bun:test";

import { toFormData } from "~/lib/to-form-data";
import { resendHandlers } from "~/tests/mocks/handlers/resend";
import { setupMockServerLifecycle } from "~/tests/msw-test-utils";
import {
  createTestContextProvider,
  createValidationErrorResponse,
} from "~/tests/test-utils";

import { action } from "./register";

const createUrl = () => `http://localhost:3000/register`;

async function sendRequest({ formData }: { formData: FormData }) {
  const request = new Request(createUrl(), { body: formData, method: "POST" });
  const params = {};

  return await action({
    context: await createTestContextProvider({
      params,
      request,
    }),
    params,
    request,
    unstable_pattern: "/register",
  });
}

setupMockServerLifecycle(...resendHandlers);

describe("/register route action", () => {
  test("given: a valid email, should: redirect to /verify (with an email cookie, which is verified in the E2E tests)", async () => {
    const email = "test@example.com";
    const formData = toFormData({ email });

    const response = (await sendRequest({ formData })) as Response;

    const redirectStatus = 302;
    expect(response.status).toEqual(redirectStatus);
    expect(response.headers.get("Location")).toEqual("/verify");
  });

  test.each([
    {
      body: {},
      expected: createValidationErrorResponse(
        {},
        { email: ["auth:register.errors.invalidEmail"] },
      ),
      given: "no email",
    },
    {
      body: { email: "invalid-email" },
      expected: createValidationErrorResponse(
        { email: "invalid-email" },
        { email: ["auth:register.errors.invalidEmail"] },
      ),
      given: "an invalid email",
    },
  ])(
    "given: $given, should: return a 400 status code with an error message",
    async ({ body, expected }) => {
      const formData = toFormData(body);

      const actual = await sendRequest({ formData });

      expect(actual).toEqual(expected);
    },
  );
});
