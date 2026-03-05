import type { MiddlewareFunction, Params } from "react-router";
import { RouterContextProvider } from "react-router";

import { i18nextMiddleware } from "~/middleware/i18next";

/**
 * Creates a RouterContextProvider configured for use in tests.
 *
 * This helper initializes a new RouterContextProvider and runs the i18next
 * middleware followed by any additional middlewares provided. It is useful when
 * testing components or routes that depend on React Router's context with
 * specific middleware setup.
 
 * @param middlewares - Array of middleware functions to run after i18next
 * middleware.
 * @param params - Route parameters to pass to middlewares.
 * @param request - Request object to pass to middlewares.
 * @returns A RouterContextProvider instance populated by the executed
 * middlewares.
 */
export async function createTestContextProvider({
  middlewares = [],
  params,
  request,
  unstable_pattern = "/test",
}: {
  middlewares?: MiddlewareFunction[];
  params: Params;
  request: Request;
  unstable_pattern?: string;
}) {
  const context = new RouterContextProvider();
  const args = { context, params, request, unstable_pattern };

  // i18next middleware runs in root loader, so all routes have access to the
  // i18next context.
  await i18nextMiddleware(args, () =>
    Promise.resolve(new Response(null, { status: 200 })),
  );

  for (const middleware of middlewares) {
    try {
      await middleware(args, () =>
        Promise.resolve(new Response(null, { status: 200 })),
      );
    } catch (error) {
      // If middleware throws a Response (e.g., redirect), re-throw it
      // This allows tests to catch authentication failures, redirects, etc.
      if (error instanceof Response) {
        throw error;
      }
      // For other errors, also re-throw
      throw error;
    }
  }

  return context;
}
