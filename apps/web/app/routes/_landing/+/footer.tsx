import {
  IconBrandGithub,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandYoutube,
} from "@tabler/icons-react";
import { buttonVariants } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";

import { ThemeToggle } from "~/features/color-scheme/theme-toggle";

import { Logo } from "./logo";

const socialLinks = [
  { icon: <IconBrandGithub />, label: "GitHub", link: "#" },
  { icon: <IconBrandInstagram />, label: "Instagram", link: "#" },
  { icon: <IconBrandLinkedin />, label: "LinkedIn", link: "#" },
  { icon: <XIcon />, label: "X", link: "#" },
  { icon: <IconBrandYoutube />, label: "YouTube", link: "#" },
];

export function Footer() {
  const { t } = useTranslation("landing");

  const resources = [
    { href: "#", title: t("footer.resources.blog") },
    { href: "#", title: t("footer.resources.helpCenter") },
    { href: "#", title: t("footer.resources.contactSupport") },
    { href: "#", title: t("footer.resources.community") },
    { href: "#", title: t("footer.resources.security") },
  ];

  const company = [
    { href: "#", title: t("footer.company.aboutUs") },
    { href: "#", title: t("footer.company.careers") },
    { href: "#", title: t("footer.company.brandAssets") },
    { href: "#", title: t("footer.company.privacyPolicy") },
    { href: "#", title: t("footer.company.termsOfService") },
  ];

  return (
    <footer className="relative">
      <div
        className={cn(
          "mx-auto max-w-4xl lg:border-x",
          "dark:bg-[radial-gradient(35%_80%_at_25%_0%,--theme(--color-foreground/.1),transparent)]",
        )}
      >
        <div className="bg-border absolute inset-x-0 h-px w-full" />
        <div className="grid max-w-4xl grid-cols-6 gap-6 p-4">
          <div className="col-span-6 flex flex-col gap-4 pt-5 md:col-span-4">
            <a aria-label="Home" className="w-max" href="#">
              <Logo className="h-5" />
            </a>
            <p className="text-muted-foreground max-w-sm text-sm text-balance">
              {t("footer.tagline")}
            </p>
            <div className="flex gap-2">
              {socialLinks.map((item) => (
                <a
                  aria-label={item.label}
                  className={buttonVariants({
                    size: "icon-sm",
                    variant: "outline",
                  })}
                  href={item.link}
                  key={item.label}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {item.icon}
                </a>
              ))}
              <ThemeToggle />
            </div>
          </div>
          <div className="col-span-3 w-full md:col-span-1">
            <span className="text-muted-foreground text-xs">
              {t("footer.resourcesHeading")}
            </span>
            <ul className="mt-2 flex flex-col gap-2">
              {resources.map(({ href, title }) => (
                <li key={title}>
                  <a className="w-max text-sm hover:underline" href={href}>
                    {title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-3 w-full md:col-span-1">
            <span className="text-muted-foreground text-xs">
              {t("footer.companyHeading")}
            </span>
            <ul className="mt-2 flex flex-col gap-2">
              {company.map(({ href, title }) => (
                <li key={title}>
                  <a className="w-max text-sm hover:underline" href={href}>
                    {title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="bg-border absolute inset-x-0 h-px w-full" />
        <div className="flex max-w-4xl flex-col justify-between gap-2 py-4">
          <p className="text-muted-foreground text-center text-sm font-light">
            &copy; {new Date().getFullYear()} {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}

function XIcon(props: ComponentProps<"svg">) {
  return (
    <svg
      fill="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="m18.9,1.153h3.682l-8.042,9.189,9.46,12.506h-7.405l-5.804-7.583-6.634,7.583H.469l8.6-9.831L0,1.153h7.593l5.241,6.931,6.065-6.931Zm-1.293,19.494h2.039L6.482,3.239h-2.19l13.314,17.408Z" />
    </svg>
  );
}
