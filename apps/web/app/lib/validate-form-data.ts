import { parseSubmission, report } from "@conform-to/react/future";
import type * as z from "zod";

import { badRequest } from "./data-responses.server";

/**
 * Validates form data from a request using a Zod schema.
 *
 * @param request - The HTTP request containing the form data to validate
 * @param schema - A Zod schema to validate the form data against
 * @returns A result object with either `{ success: true, data: T, submission }` on success
 * or `{ success: false, response }` on validation failure
 */
export async function validateFormData<T extends z.ZodTypeAny>(
  request: Request,
  schema: T,
) {
  const formData = await request.formData();
  const submission = parseSubmission(formData);
  const result = await schema.safeParseAsync(submission.payload);

  if (!result.success) {
    return {
      response: badRequest({
        result: report(submission, {
          error: { issues: result.error.issues },
        }),
      }),
      success: false as const,
    };
  }

  return {
    data: result.data as z.output<T>,
    submission,
    success: true as const,
  };
}
