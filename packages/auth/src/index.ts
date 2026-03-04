import { createId } from "@paralleldrive/cuid2";
import { db } from "@workspace/db";
import * as schema from "@workspace/db/schema";
import { sendEmail } from "@workspace/email/send-email";
import { OtpEmail } from "@workspace/email/templates/otp-email";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { emailOTP, organization, testUtils } from "better-auth/plugins";
import { createElement } from "react";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        const subject =
          type === "sign-in"
            ? "Sign in to your account"
            : type === "forget-password"
              ? "Reset your password"
              : "Verify your email";

        await sendEmail({
          to: email,
          subject,
          react: createElement(OtpEmail, { otp, type }),
        });
      },
    }),
    organization(),
    ...(process.env.NODE_ENV !== "production" ? [testUtils()] : []),
  ],
  advanced: {
    database: {
      generateId: () => createId(),
    },
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
