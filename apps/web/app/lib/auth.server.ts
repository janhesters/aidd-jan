import { db } from "@workspace/db";
import { sendEmail } from "@workspace/email/send";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP, organization, testUtils } from "better-auth/plugins";

import { OtpEmail } from "~/emails/otp-email";
import { localeCookie } from "~/middleware/i18next";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "sqlite" }),
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: { enabled: false },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }, ctx) {
        const cookieHeader = ctx?.headers?.get("cookie") ?? null;
        const locale =
          ((await localeCookie.parse(cookieHeader)) as "de" | "en" | null) ??
          "en";

        await sendEmail({
          to: email,
          subject: otp,
          react: OtpEmail({ otp, type, locale }),
        });
      },
    }),
    organization(),
    ...(process.env.NODE_ENV !== "production"
      ? [testUtils({ captureOTP: true })]
      : []),
  ],
});
