import { createClient } from "@libsql/client";
import { createId } from "@paralleldrive/cuid2";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP, organization, testUtils } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../../packages/db/src/schema";

export const client = createClient({ url: "file:../../apps/web/local.db" });
const db = drizzle(client, { schema });

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "sqlite" }),
  advanced: { database: { generateId: () => createId() } },
  plugins: [
    emailOTP({ sendVerificationOTP() {} }),
    organization(),
    testUtils({ captureOTP: true }),
  ],
});
