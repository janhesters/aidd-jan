import type { RenderOptions } from "@testing-library/react";
import { render } from "@testing-library/react";
import i18next from "i18next";
import type { ReactElement, ReactNode } from "react";
import { I18nextProvider, initReactI18next } from "react-i18next";

import resources from "~/locales";

// Initialize i18next for tests with actual translations.
void i18next.use(initReactI18next).init({
  initImmediate: false,
  lng: "en",
  react: {
    useSuspense: false,
  },
  resources,
});

const AllTheProviders = ({ children }: { children: ReactNode }) => {
  return <I18nextProvider i18n={i18next}>{children}</I18nextProvider>;
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };
export { default as userEvent } from "@testing-library/user-event";
export { createRoutesStub } from "react-router";
