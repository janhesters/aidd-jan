import { IconArrowRight, IconPhoneCall } from "@tabler/icons-react";
import { buttonVariants } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { Img } from "openimg/react";
import { useTranslation } from "react-i18next";

import { getLocalImageSrc } from "~/lib/images/sources";

import { DecorIcon } from "./decor-icon";
import { FullWidthDivider } from "./full-width-divider";

export function HeroSection() {
  const { t } = useTranslation("landing");

  return (
    <section>
      <div className="relative flex flex-col items-center justify-center gap-5 px-4 py-12 md:px-4 md:py-24 lg:py-28">
        {/* Faded vertical borders & background glow */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-1 size-full overflow-hidden"
        >
          <div
            className={cn(
              "absolute -inset-x-20 inset-y-0 z-0 rounded-full",
              "bg-[radial-gradient(ellipse_at_center,theme(--color-foreground/.1),transparent,transparent)]",
              "blur-[50px]",
            )}
          />
          <div className="via-border to-border absolute inset-y-0 left-4 w-px bg-linear-to-b from-transparent md:left-8" />
          <div className="via-border to-border absolute inset-y-0 right-4 w-px bg-linear-to-b from-transparent md:right-8" />
          <div className="via-border/50 to-border/50 absolute inset-y-0 left-8 w-px bg-linear-to-b from-transparent md:left-12" />
          <div className="via-border/50 to-border/50 absolute inset-y-0 right-8 w-px bg-linear-to-b from-transparent md:right-12" />
        </div>

        <a
          className={cn(
            "group bg-card mx-auto flex w-fit items-center gap-3 rounded-sm border p-1 shadow",
            "fade-in slide-in-from-bottom-10 animate-in fill-mode-backwards transition-all delay-500 duration-500 ease-out",
          )}
          href="#link"
        >
          <div className="bg-card rounded-xs border px-1.5 py-0.5 shadow-sm">
            <p className="font-mono text-xs">{t("announcementLabel")}</p>
          </div>
          <span className="text-xs">{t("announcement")}</span>
          <span className="block h-5 border-l" />
          <div className="pr-1">
            <IconArrowRight className="size-3 -translate-x-0.5 duration-150 ease-out group-hover:translate-x-0.5" />
          </div>
        </a>

        <h1
          className={cn(
            "text-foreground max-w-2xl text-center text-3xl text-balance md:text-5xl lg:text-6xl",
            "fade-in slide-in-from-bottom-10 animate-in fill-mode-backwards delay-100 duration-500 ease-out",
          )}
        >
          {t("heading")}
        </h1>

        <p
          className={cn(
            "text-muted-foreground text-center text-sm tracking-wider sm:text-lg",
            "fade-in slide-in-from-bottom-10 animate-in fill-mode-backwards delay-200 duration-500 ease-out",
          )}
        >
          {t("subtitle")}
        </p>

        <div className="fade-in slide-in-from-bottom-10 animate-in fill-mode-backwards flex w-fit items-center justify-center gap-3 pt-2 delay-300 duration-500 ease-out">
          <a className={buttonVariants({ variant: "outline" })} href="#">
            <IconPhoneCall data-icon="inline-start" /> {t("bookCall")}
          </a>
          <a className={buttonVariants()} href="#">
            {t("getStarted")} <IconArrowRight data-icon="inline-end" />
          </a>
        </div>
      </div>

      <div className="relative">
        <DecorIcon className="size-4" position="top-left" />
        <DecorIcon className="size-4" position="top-right" />
        <DecorIcon className="size-4" position="bottom-left" />
        <DecorIcon className="size-4" position="bottom-right" />

        <FullWidthDivider className="-top-px" />
        <div className="overflow-hidden *:pointer-events-none *:aspect-video *:select-none">
          <Img
            alt="Application dashboard preview"
            className="dark:hidden"
            height={1080}
            isAboveFold
            src={getLocalImageSrc("dashboardLight")}
            width={1920}
          />
          <Img
            alt="Application dashboard preview"
            className="hidden dark:block"
            height={1080}
            isAboveFold
            src={getLocalImageSrc("dashboardDark")}
            width={1920}
          />
        </div>
        <FullWidthDivider className="-bottom-px" />
      </div>
    </section>
  );
}
