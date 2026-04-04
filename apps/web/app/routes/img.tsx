import { getImgResponse, type GetImgSourceArgs } from "openimg/node";

import type { Route } from "./+types/img";

const optimizerCacheControl =
  "public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400";

function parseOrigins(csv: string | undefined): string[] {
  if (!csv) return [];

  return csv
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .filter((origin) => URL.canParse(origin))
    .map((origin) => new URL(origin).origin);
}

function getImgSource({ request }: GetImgSourceArgs) {
  const source = new URL(request.url).searchParams.get("src");

  if (!source) {
    return new Response(null, {
      status: 400,
      statusText: 'Search param "src" must be set',
    });
  }

  if (URL.canParse(source)) {
    return {
      type: "fetch",
      url: source,
    } as const;
  }

  return {
    type: "fs",
    path: `./public${source}`,
  } as const;
}

export function loader({ request }: Route.LoaderArgs) {
  const headers = new Headers();
  headers.set("Cache-Control", optimizerCacheControl);

  const requestOrigin = new URL(request.url).origin;

  return getImgResponse(request, {
    allowlistedOrigins: [
      requestOrigin,
      ...parseOrigins(process.env.IMAGE_REMOTE_ALLOWLIST),
    ],
    cacheFolder: process.env.NODE_ENV === "production" ? "no_cache" : undefined,
    getImgSource,
    headers,
  });
}
