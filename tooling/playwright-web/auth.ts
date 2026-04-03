import path from "node:path";

import { createClient } from "@libsql/client";
import { createId } from "@paralleldrive/cuid2";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP, organization, testUtils } from "better-auth/plugins";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "../../packages/db/src/schema";

export const client = createClient({
  url: `file:${path.join(import.meta.dirname, "../../apps/web/local.db")}`,
});
const db = drizzle(client, { schema });

// NOTE: This config must stay in sync with apps/web/app/lib/auth.server.ts.
// If the app's auth config gains new plugins or providers, update this instance to match.
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "sqlite" }),
  advanced: { database: { generateId: () => createId() } },
  socialProviders: {
    google: {
      clientId: "emulate-google-client-id",
      clientSecret: "emulate-google-client-secret",
    },
  },
  plugins: [
    emailOTP({ sendVerificationOTP() {} }),
    organization(),
    testUtils({ captureOTP: true }),
  ],
});
