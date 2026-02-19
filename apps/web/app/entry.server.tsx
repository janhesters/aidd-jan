import crypto from "node:crypto";
import { PassThrough } from "node:stream";

import { contentSecurity } from "@nichtsam/helmet/content";
import { createReadableStreamFromReadable } from "@react-router/node";
import { NonceProvider } from "@workspace/security/nonce-provider";
import { isbot } from "isbot";
import type { RenderToPipeableStreamOptions } from "react-dom/server";
import { renderToPipeableStream } from "react-dom/server";
import { I18nextProvider } from "react-i18next";
import type { EntryContext, RouterContextProvider } from "react-router";
import { ServerRouter } from "react-router";

import { getInstance } from "./middleware/i18next";
import { getEnv, init } from "./utils/env.server";

init();
global.ENV = getEnv();

export const streamTimeout = 5000;

const oneSecond = 1000;
const nonceLength = 16;
const MODE = process.env.NODE_ENV ?? "development";

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  entryContext: EntryContext,
  routerContext: RouterContextProvider,
) {
  const nonce = crypto.randomBytes(nonceLength).toString("hex");

  return new Promise((resolve, reject) => {
    let shellRendered = false;
    const userAgent = request.headers.get("user-agent");

    const readyOption: keyof RenderToPipeableStreamOptions =
      (userAgent && isbot(userAgent)) || entryContext.isSpaMode ? "onAllReady" : "onShellReady";

    let timeoutId: ReturnType<typeof setTimeout> | undefined = setTimeout(
      () => abort(),
      streamTimeout + oneSecond,
    );

    const { abort, pipe } = renderToPipeableStream(
      <NonceProvider value={nonce}>
        <I18nextProvider i18n={getInstance(routerContext)}>
          <ServerRouter context={entryContext} nonce={nonce} url={request.url} />
        </I18nextProvider>
      </NonceProvider>,
      {
        nonce,
        onError(error: unknown) {
          const internalServerErrorStatusCode = 500;
          responseStatusCode = internalServerErrorStatusCode;
          if (shellRendered) {
            console.error(error); // oxlint-disable-line eslint(no-console) -- Log render errors after shell is rendered
          }
        },
        onShellError(error: unknown) {
          reject(error as Error);
        },
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough({
            final(callback) {
              clearTimeout(timeoutId);
              timeoutId = undefined;
              callback();
            },
          });
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");

          contentSecurity(responseHeaders, {
            contentSecurityPolicy: {
              directives: {
                fetch: {
                  "connect-src": [MODE === "development" ? "ws:" : undefined, "'self'"],
                  "font-src": ["'self'"],
                  "frame-src": ["'self'"],
                  "img-src": ["'self'", "data:"],
                  "script-src": ["'strict-dynamic'", "'self'", `'nonce-${nonce}'`],
                  "script-src-attr": [`'nonce-${nonce}'`],
                },
              },
              reportOnly: MODE !== "production",
            },
            crossOriginEmbedderPolicy: false,
          });

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          );

          pipe(body);
        },
      },
    );
  });
}
