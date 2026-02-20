import { z } from "zod";

const schema = z.object({
  ALLOW_INDEXING: z.enum(["true", "false"]).optional(),
  NODE_ENV: z.enum(["production", "development", "test"] as const),
});

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof schema> {}
  }
}

export function init() {
  const parsed = schema.safeParse(process.env);

  if (parsed.success === false) {
    console.error("Invalid environment variables:", z.flattenError(parsed.error).fieldErrors);

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
