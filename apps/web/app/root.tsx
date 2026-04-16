import { useNonce } from "@workspace/security/nonce-provider";
import { securityMiddleware } from "@workspace/security/security-middleware";
import { Toaster } from "@workspace/ui/components/sonner";
import { OpenImgContextProvider } from "openimg/react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { ShouldRevalidateFunctionArgs } from "react-router";
import {
  data,
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "react-router";
import type { ToasterProps } from "sonner";

import type { Route } from "./+types/root";
import { getColorScheme } from "./lib/color-scheme/color-scheme.server";
import { useColorScheme } from "./lib/color-scheme/use-color-scheme";
import { combineHeaders } from "./lib/combine-headers.server";
import { getEnv } from "./lib/env.server";
import { getToast } from "./lib/toast.server";
import { useToast } from "./lib/use-toast";
import {
  getLocale,
  i18nextMiddleware,
  localeCookie,
} from "./middleware/i18next";

import sonnerStyles from "sonner/dist/styles.css?url";
import "@workspace/ui/globals.css";
import "./styles/fonts.css";

export const links: Route.LinksFunction = () => [
  { href: sonnerStyles, rel: "stylesheet" },
];

/**
 * By enabling single fetch, the loaders will no longer revalidate the data when
 * the action status is in the 4xx range. This behavior will prevent toasts from
 * being displayed for failed actions, so we opt in to revalidate the root
 * loader data when the action status is in the 4xx range.
 */
export const shouldRevalidate = ({
  defaultShouldRevalidate,
  actionStatus,
}: ShouldRevalidateFunctionArgs) => {
  if (actionStatus && actionStatus > 399 && actionStatus < 500) {
    return true;
  }

  return defaultShouldRevalidate;
};

export const middleware = [securityMiddleware, i18nextMiddleware];

export async function loader({ request, context }: Route.LoaderArgs) {
  const locale = getLocale(context);
  const [colorScheme, { toast, headers: toastHeaders }] = await Promise.all([
    getColorScheme(request),
    getToast(request),
  ]);

  return data(
    { ENV: getEnv(), colorScheme, locale, toast },
    {
      headers: combineHeaders(
        { "Set-Cookie": await localeCookie.serialize(locale) },
        toastHeaders,
      ),
    },
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const loaderData = useLoaderData<typeof loader>();
  const colorScheme = useColorScheme();
  const nonce = useNonce();
  const { i18n } = useTranslation();
  const allowIndexing = loaderData?.ENV.ALLOW_INDEXING !== "false";
  useToast(loaderData?.toast);

  return (
    <html
      className={colorScheme}
      dir={i18n.dir(i18n.language)}
      lang={i18n.language}
    >
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        {allowIndexing ? null : (
          <meta content="noindex, nofollow" name="robots" />
        )}
        <Meta />
        <Links />
      </head>
      <body>
        <OpenImgContextProvider
          breakpoints={[640, 768, 1024, 1280, 1536]}
          optimizerEndpoint={loaderData?.ENV.IMAGE_OPTIMIZER_ENDPOINT ?? "/img"}
          targetFormats={["avif", "webp"]}
        >
          {children}
        </OpenImgContextProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(loaderData?.ENV ?? {})}`,
          }}
          nonce={nonce}
        />
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
        <Toaster
          position="bottom-right"
          theme={colorScheme as ToasterProps["theme"]}
        />
      </body>
    </html>
  );
}

export default function App({ loaderData: { locale } }: Route.ComponentProps) {
  const { i18n } = useTranslation();
  useEffect(() => {
    if (i18n.language !== locale) void i18n.changeLanguage(locale);
  }, [locale, i18n]);
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="container mx-auto p-4 pt-16">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full overflow-x-auto p-4">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
