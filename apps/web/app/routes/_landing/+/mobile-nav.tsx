import { IconMenu2 } from "@tabler/icons-react";
import { Button, buttonVariants } from "@workspace/ui/components/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { useTranslation } from "react-i18next";

import { navLinks } from "./header";

export function MobileNav() {
  const { t } = useTranslation("landing");

  return (
    <div className="md:hidden">
      <Sheet>
        <SheetTrigger
          render={
            <Button aria-label="Toggle menu" size="icon" variant="outline" />
          }
        >
          <IconMenu2 className="size-4.5" />
        </SheetTrigger>
        <SheetContent side="right">
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <nav aria-label="Mobile">
            <ul className="grid gap-y-2 p-4">
              {navLinks.map((link) => (
                <li key={link.labelKey}>
                  <a
                    className={buttonVariants({
                      className: "justify-start",
                      variant: "ghost",
                    })}
                    href={link.href}
                  >
                    {t(link.labelKey)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto flex flex-col gap-2 p-4">
            <a
              className={buttonVariants({
                className: "w-full",
                variant: "outline",
              })}
              href="#"
            >
              {t("signIn")}
            </a>
            <a className={buttonVariants({ className: "w-full" })} href="#">
              {t("getStarted")}
            </a>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
