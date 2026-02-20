import { Welcome } from "../welcome/welcome";
import type { Route } from "./+types/index";
import { getInstance } from "~/middleware/i18next";

export async function loader({ context }: Route.LoaderArgs) {
  const t = getInstance(context).getFixedT(null, "landing");
  return { description: t("description"), title: t("title") };
}

export function meta({ data }: Route.MetaArgs) {
  return [
    { title: data?.title },
    { content: data?.description, name: "description" },
  ];
}

export default function Home() {
  return <Welcome />;
}
