import "@workspace/ui/globals.css";
import "./styles/fonts.css";

import { useNonce } from "@workspace/security/nonce-provider";
import { securityMiddleware } from "@workspace/security/security-middleware";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
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

import type { Route } from "./+types/root";
import { getLocale, i18nextMiddleware, localeCookie } from "./middleware/i18next";
import { getEnv } from "./utils/env.server";

export const middleware = [securityMiddleware, i18nextMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
  const locale = getLocale(context);
  return data(
    { ENV: getEnv(), locale },
    { headers: { "Set-Cookie": await localeCookie.serialize(locale) } },
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const loaderData = useLoaderData<typeof loader>();
  const nonce = useNonce();
  const { i18n } = useTranslation();
  const allowIndexing = loaderData?.ENV.ALLOW_INDEXING !== "false";

  return (
    <html dir={i18n.dir(i18n.language)} lang={i18n.language}>
      <head>
        <meta charSet="utf-8" />
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        {allowIndexing ? null : <meta content="noindex, nofollow" name="robots" />}
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <script
          // oxlint-disable-next-line react/no-danger -- This is how you expose public env variables to the client with React Router.
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(loaderData?.ENV ?? {})}`,
          }}
          nonce={nonce}
        />
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App({ loaderData: { locale } }: Route.ComponentProps) {
  const { i18n } = useTranslation();
  useEffect(() => {
    if (i18n.language !== locale) i18n.changeLanguage(locale);
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
      error.status === 404 ? "The requested page could not be found." : error.statusText || details;
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
