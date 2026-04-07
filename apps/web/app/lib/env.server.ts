import { z } from "zod";

const schema = z.object({
  ALLOW_INDEXING: z.enum(["true", "false"]).optional(),
  MOCKS: z.literal("true").optional(),
  BETTER_AUTH_SECRET: z
    .string()
    .min(1)
    .default("s3cr3t-f0r-d3v-0nly-ch4ng3-1n-pr0d"),
  BETTER_AUTH_URL: z.url().default("https://web.localhost"),
  COOKIE_SECRET: z.string().min(1).default("s3cr3t"),
  GOOGLE_CLIENT_ID: z.string().min(1).default("emulate-google-client-id"),
  GOOGLE_CLIENT_SECRET: z
    .string()
    .min(1)
    .default("emulate-google-client-secret"),
  EMAIL_FROM: z.string().optional(),
  NODE_ENV: z.enum(["production", "development", "test"] as const),
  IMAGE_OPTIMIZER_ENDPOINT: z.string().optional(),
  IMAGE_REMOTE_ALLOWLIST: z.string().optional(),
  IMAGE_SOURCE_MODE: z.enum(["local", "blob", "mixed"] as const).optional(),
  RESEND_API_KEY: z.string().optional(),
  VERCEL_BLOB_BASE_URL: z.url().optional(),
});

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Omit<z.infer<typeof schema>, "NODE_ENV"> {}
  }
}

export function init() {
  const parsed = schema.safeParse(process.env);

  if (parsed.success === false) {
    console.error(
      "Invalid environment variables:",
      z.flattenError(parsed.error).fieldErrors,
    );

    throw new Error("Invalid environment variables");
  }
}

/**
 * Returns public ENV variables safe to expose to the client.
 *
 * NOTE: Do *not* add any environment variables in here that you do not wish to
 * be included in the client.
 */
export function getEnv() {
  return {
    ALLOW_INDEXING: process.env.ALLOW_INDEXING,
    IMAGE_OPTIMIZER_ENDPOINT: process.env.IMAGE_OPTIMIZER_ENDPOINT ?? "/img",
    MODE: process.env.NODE_ENV,
  };
}

type Env = ReturnType<typeof getEnv>;

declare global {
  var ENV: Env;
  interface Window {
    ENV: Env;
  }
}
