import colorScheme from "./color-scheme";
import landing from "./landing";
import translation from "./translation";

export default {
  colorScheme,
  landing,
  translation,
} satisfies typeof import("~/locales/en/index").default;
