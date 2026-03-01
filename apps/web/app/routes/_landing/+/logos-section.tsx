import { useTranslation } from "react-i18next";

import { DecorIcon } from "./decor-icon";
import { FullWidthDivider } from "./full-width-divider";
import { LogoCloud } from "./logo-cloud";

export function LogosSection() {
  const { t } = useTranslation("landing");

  return (
    <section className="mb-12">
      <h2 className="text-muted-foreground py-6 text-center text-lg font-medium tracking-tight md:text-xl">
        {t("trustedBy")}{" "}
        <span className="text-foreground">{t("trustedByHighlight")}</span>
      </h2>
      <div className="relative *:border-0">
        <DecorIcon className="size-4" position="top-left" />
        <DecorIcon className="size-4" position="top-right" />
        <DecorIcon className="size-4" position="bottom-left" />
        <DecorIcon className="size-4" position="bottom-right" />

        <FullWidthDivider className="-top-px" />
        <LogoCloud />
        <FullWidthDivider className="-bottom-px" />
      </div>
    </section>
  );
}
