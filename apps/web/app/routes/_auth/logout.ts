import { logout } from "./+/logout.server";
import type { Route } from "./+types/logout";

export async function loader({ request }: Route.LoaderArgs) {
  return await logout(request);
}

export async function action({ request }: Route.ActionArgs) {
  return await logout(request);
}
