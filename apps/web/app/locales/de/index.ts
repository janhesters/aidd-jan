import auth from "./auth";
import colorScheme from "./color-scheme";
import getStarted from "./get-started";
import landing from "./landing";
import translation from "./translation";

export default {
  auth,
  colorScheme,
  getStarted,
  landing,
  translation,
} satisfies typeof import("~/locales/en/index").default;
