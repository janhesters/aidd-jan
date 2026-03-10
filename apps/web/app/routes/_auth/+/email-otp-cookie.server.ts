import { createCookie } from "react-router";
import { createTypedCookie } from "remix-utils/typed-cookie";
import { z } from "zod";

import { retrieveVerificationFromDatabaseByIdentifier } from "~/lib/database/facades.server";

const cookieDefinition = createCookie("email-otp", {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  secrets: [process.env.COOKIE_SECRET],
  secure: process.env.NODE_ENV === "production",
});

const schema = z.email();
const typedCookie = createTypedCookie({ cookie: cookieDefinition, schema });

const DEFAULT_MAX_AGE = 300; // 5 minutes
const MILLISECONDS_PER_SECOND = 1000;

export async function getEmailFromCookie(
  request: Request,
): Promise<string | null> {
  return await typedCookie.parse(request.headers.get("Cookie"));
}

/**
 * Serializes the email cookie value.
 * When maxAge is provided, returns a full Set-Cookie header value with attributes.
 * When maxAge is not provided, returns just the cookie value for use in Cookie headers.
 */
export async function serializeEmailCookie(email: string, maxAge?: number) {
  return await typedCookie.serialize(
    email,
    typeof maxAge === "number" ? { maxAge } : undefined,
  );
}

export async function setEmailCookie(email: string) {
  const identifier = `sign-in-otp-${email.toLowerCase()}`;
  const record = await retrieveVerificationFromDatabaseByIdentifier(identifier);

  let maxAge = DEFAULT_MAX_AGE;

  if (record) {
    const expiresAt = record.expiresAt.getTime();
    const now = Date.now();
    maxAge = Math.max(
      0,
      Math.floor((expiresAt - now) / MILLISECONDS_PER_SECOND),
    );
  }

  return new Headers({
    "Set-Cookie": await serializeEmailCookie(email, maxAge),
  });
}

export async function destroyEmailCookie() {
  return new Headers({
    "Set-Cookie": await cookieDefinition.serialize("", { maxAge: 0 }),
  });
}
