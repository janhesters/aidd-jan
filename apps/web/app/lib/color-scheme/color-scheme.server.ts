import type { ActionFunction } from "react-router";
import { createCookie, data } from "react-router";
import { createTypedCookie } from "remix-utils/typed-cookie";
import { z } from "zod";

import type { ColorScheme } from "./color-scheme-constants";
import { COLOR_SCHEME_FORM_KEY, colorSchemes } from "./color-scheme-constants";

const cookie = createCookie("color-scheme", {
  httpOnly: true,
  path: "/",
  sameSite: "lax",
  secrets: [process.env.COOKIE_SECRET ?? "s3cr3t"],
});

const schema = z
  .enum([colorSchemes.dark, colorSchemes.light, colorSchemes.system])
  .default(colorSchemes.system)
  .catch(colorSchemes.system);

const typedCookie = createTypedCookie({ cookie, schema });

export async function getColorScheme(request: Request): Promise<ColorScheme> {
  const colorScheme = await typedCookie.parse(request.headers.get("Cookie"));
  return colorScheme ?? colorSchemes.system;
}

export async function setColorScheme(colorScheme: ColorScheme) {
  return await typedCookie.serialize(colorScheme);
}

export const colorSchemeAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const colorScheme = schema.parse(formData.get(COLOR_SCHEME_FORM_KEY));
  return data(null, {
    headers: { "Set-Cookie": await setColorScheme(colorScheme) },
  });
};
