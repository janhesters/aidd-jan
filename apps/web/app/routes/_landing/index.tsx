import { getInstance } from "~/middleware/i18next";

import { FaqSection } from "./+/faq-section";
import { FeatureSection } from "./+/feature-section";
import { HeroSection } from "./+/hero-section";
import { LogosSection } from "./+/logos-section";
import type { Route } from "./+types/index";

export async function loader({ context }: Route.LoaderArgs) {
  const t = getInstance(context).getFixedT(null, "landing");
  return { description: t("description"), title: t("title") };
}

export function meta({ loaderData }: Route.MetaArgs) {
  return [
    { title: loaderData?.title },
    { content: loaderData?.description, name: "description" },
  ];
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <LogosSection />
      <FeatureSection />
      <FaqSection />
    </>
  );
}
