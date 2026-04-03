import type { HttpHandler } from "msw";
import { HttpResponse, bypass, http } from "msw";

const EMULATE_GOOGLE_URL = "http://localhost:4002";

/**
 * MSW handlers that proxy Google OAuth requests to the Emulate dev server.
 *
 * Why MSW is needed: Emulate's design is "configure your app to point to local
 * endpoints." This works for the authorization endpoint — Better Auth exposes an
 * `authorizationEndpoint` option we can override. But Better Auth's Google
 * provider hardcodes `https://oauth2.googleapis.com/token` inside
 * `validateAuthorizationCode()` with no override. Since we can't change where
 * Better Auth sends the token exchange request, we use MSW to intercept it and
 * proxy to Emulate's `/oauth2/token` endpoint.
 */
export const googleOAuthHandlers: Array<HttpHandler> = [
  http.post("https://oauth2.googleapis.com/token", async ({ request }) => {
    const body = await request.text();
    // bypass() prevents MSW from re-intercepting this outbound request
    const proxyRequest = bypass(
      new Request(`${EMULATE_GOOGLE_URL}/oauth2/token`, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body,
      }),
    );
    const response = await fetch(proxyRequest);
    const data = await response.text();
    return new HttpResponse(data, {
      status: response.status,
      headers: {
        "content-type":
          response.headers.get("content-type") ?? "application/json",
      },
    });
  }),
];
