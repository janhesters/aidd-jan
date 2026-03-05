import {
  emailOTPClient,
  inferAdditionalFields,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

import type { auth } from "./auth.server";

export const authClient = createAuthClient({
  plugins: [
    organizationClient(),
    emailOTPClient(),
    inferAdditionalFields<typeof auth>(),
  ],
});
