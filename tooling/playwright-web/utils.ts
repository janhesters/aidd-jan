import { readFile } from "node:fs/promises";
import path from "node:path";

import type { APIResponse, Page } from "@playwright/test";
import type { User } from "better-auth";
import { auth, client } from "./auth";

export async function loginByCookie({
  page,
  userId,
}: { page: Page; userId: string }) {
  const ctx = await auth.$context;
  const cookies = await ctx.test.getCookies({
    userId,
    domain: process.env.CI ? "localhost" : "web.localhost",
  });
  await page.context().addCookies(cookies);
}

export async function loginAndSaveUserToDatabase({
  user,
  page,
}: { user?: Partial<User>; page: Page }) {
  const ctx = await auth.$context;
  const created = ctx.test.createUser(user);
  await ctx.test.saveUser(created);
  await loginByCookie({ page, userId: created.id });
  return { user: created };
}

export async function teardownUser(userId: string) {
  const ctx = await auth.$context;
  try {
    await ctx.test.deleteUser(userId);
  } catch {}
}

const EMAIL_FIXTURES_PATH = path.join(
  import.meta.dirname,
  "../../apps/web/app/tests/mocks/fixtures/email",
);

/**
 * Reads the OTP from the email fixture written by the MSW handler.
 * The app's MSW handler writes emails to fixture files keyed by recipient.
 * The OTP is stored in the email's `subject` field.
 */
export async function getOTPFromEmail(email: string): Promise<string> {
  const filePath = path.join(EMAIL_FIXTURES_PATH, `${email.toLowerCase()}.json`);
  const content = await readFile(filePath, "utf-8");
  const data = JSON.parse(content) as { subject: string };
  return data.subject;
}

export async function teardownUserByEmail(email: string) {
  const result = await client.execute({
    sql: "SELECT id FROM user WHERE email = ?",
    args: [email.toLowerCase()],
  });
  const userId = result.rows[0]?.id as string | undefined;
  if (userId) {
    await teardownUser(userId);
  }
}
