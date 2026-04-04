import { buttonVariants } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { useTranslation } from "react-i18next";

import { useScroll } from "~/hooks/use-scroll";

import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";

export const navLinks = [
  { href: "#", labelKey: "nav.features" },
  { href: "#", labelKey: "nav.pricing" },
  { href: "#", labelKey: "nav.about" },
] as const;

export function Header() {
  const scrolled = useScroll(10);
  const { t } = useTranslation("landing");

  return (
    <header
      className={cn(
        "sticky top-0 z-50 mx-auto w-full max-w-5xl border-b border-transparent md:rounded-md md:border md:transition-all md:ease-out",
        {
          "border-border bg-background/95 supports-backdrop-filter:bg-background/50 backdrop-blur-sm md:top-2 md:max-w-3xl md:shadow":
            scrolled,
        },
      )}
    >
      <nav
        aria-label="Main"
        className={cn(
          "flex h-14 w-full items-center justify-between px-4 md:h-12 md:transition-all md:ease-out",
          {
            "md:px-2": scrolled,
          },
        )}
      >
        <a
          aria-label="Home"
          className="hover:bg-muted dark:hover:bg-muted/50 rounded-md p-2"
          href="#"
        >
          <Logo className="h-4" />
        </a>
        <div className="hidden items-center gap-2 md:flex">
          <ul className="flex items-center">
            {navLinks.map((link) => (
              <li key={link.labelKey}>
                <a
                  className={buttonVariants({ size: "sm", variant: "ghost" })}
                  href={link.href}
                >
                  {t(link.labelKey)}
                </a>
              </li>
            ))}
          </ul>
          <a
            className={buttonVariants({ size: "sm", variant: "outline" })}
            href="#"
          >
            {t("signIn")}
          </a>
          <a className={buttonVariants({ size: "sm" })} href="#">
            {t("getStarted")}
          </a>
        </div>
        <MobileNav />
      </nav>
    </header>
  );
}
