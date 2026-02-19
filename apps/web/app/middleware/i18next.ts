import { initReactI18next } from "react-i18next";
import { createCookie } from "react-router";
import { createI18nextMiddleware } from "remix-i18next/middleware";

import resources from "~/locales";

import "i18next";

export const localeCookie = createCookie("lng", {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
});

export const [i18nextMiddleware, getLocale, getInstance] = createI18nextMiddleware({
  detection: {
    cookie: localeCookie,
    fallbackLanguage: "en",
    supportedLanguages: ["de", "en"],
  },
  i18next: { resources },
  plugins: [initReactI18next],
});

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: (typeof resources)["en"];
  }
}
