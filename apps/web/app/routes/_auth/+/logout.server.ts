import { href, redirect } from "react-router";

import { auth } from "~/lib/auth.server";

export async function logout(request: Request) {
  try {
    const { headers } = await auth.api.signOut({
      headers: request.headers,
      returnHeaders: true,
    });
    return redirect(href("/login"), { headers });
  } catch {
    // Even if signOut fails (e.g., no session), redirect to login
    return redirect(href("/login"));
  }
}
