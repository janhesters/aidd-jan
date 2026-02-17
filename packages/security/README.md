# @workspace/security

Shared security package for the monorepo. It provides two exports:

- **`@workspace/security/nonce-provider`** -- React Context that threads a CSP nonce from the server into client components.
- **`@workspace/security/security-middleware`** -- React Router middleware that sets general security headers (X-Content-Type-Options, Strict-Transport-Security, Referrer-Policy, etc.) via `@nichtsam/helmet/general`.

## What are nonces?

A nonce is a random, single-use token generated per request. The server embeds the nonce in both the CSP header and each `<script>` tag. The browser then runs only scripts whose nonce matches the header value; everything else gets blocked.

This stops inline-script injection attacks without resorting to `'unsafe-inline'`.

## Setup

### 1. Generate the nonce and set CSP headers (`entry.server.tsx`)

```tsx
import crypto from "node:crypto";
import { contentSecurity } from "@nichtsam/helmet/content";
import { NonceProvider } from "@workspace/security/nonce-provider";

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  entryContext: EntryContext,
  routerContext: RouterContextProvider,
) {
  const nonce = crypto.randomBytes(16).toString("hex");

  contentSecurity(responseHeaders, {
    contentSecurityPolicy: {
      reportOnly: true, // start in report-only mode
      directives: {
        "script-src": [
          "'self'",
          `'nonce-${nonce}'`,
        ],
        "script-src-attr": [`'nonce-${nonce}'`],
      },
    },
  });

  // ... inside renderToPipeableStream:
  const { pipe, abort } = renderToPipeableStream(
    <NonceProvider value={nonce}>
      <I18nextProvider i18n={getInstance(routerContext)}>
        <ServerRouter
          context={entryContext}
          url={request.url}
          nonce={nonce}
        />
      </I18nextProvider>
    </NonceProvider>,
    { nonce, /* ...other options */ },
  );
}
```

### 2. Pass the nonce to client scripts (`root.tsx`)

```tsx
import { useNonce } from "@workspace/security/nonce-provider";
import { securityMiddleware } from "@workspace/security/security-middleware";

export const middleware = [i18nextMiddleware, securityMiddleware];

export function Layout({ children }: { children: React.ReactNode }) {
  const nonce = useNonce();

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}
```

### 3. Register the security middleware

Add `securityMiddleware` to the `middleware` array in `root.tsx` (shown above). It runs after route handlers and appends headers like:

- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Referrer-Policy: no-referrer`
- `X-DNS-Prefetch-Control: off`

## CSP directive reference

| Directive | Controls |
|---|---|
| `default-src` | Fallback for all fetch directives |
| `script-src` | JavaScript execution |
| `style-src` | Stylesheets |
| `img-src` | Images |
| `font-src` | Font files |
| `connect-src` | XHR, fetch, WebSocket |
| `frame-ancestors` | Who can embed the page in an iframe |

`@nichtsam/helmet` ships sensible defaults for each directive. You only need to override the ones your app requires (like adding a nonce to `script-src`).

## Switching from report-only to enforced

Start with `reportOnly: true`. This logs violations to the browser console without blocking anything, so you can catch issues before they break the app.

Once the console stays clean, flip to enforced:

```ts
contentSecurity(responseHeaders, {
  contentSecurityPolicy: {
    // reportOnly: true,  <-- remove or set to false
    directives: { /* ... */ },
  },
});
```

The header changes from `Content-Security-Policy-Report-Only` to `Content-Security-Policy`, and the browser will block violating resources.
