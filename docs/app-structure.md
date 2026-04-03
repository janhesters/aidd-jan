# App structure

How to organize code in this turborepo monorepo. Shared concerns live in
`packages/` and `tooling/`, while app-specific code stays inside `apps/`.

## Monorepo layout

```
root/
  apps/
    web/                    # React Router app (see "App layout" below)
  packages/
    ui/                     # Shared UI: shadcn components, hooks, styles
    utils/                  # Shared utilities (async-pipe, types)
    security/               # CSP nonce provider, security middleware
    typescript-config/      # Shared tsconfig presets
    playwright-utilities/   # E2E test helpers (getJson, getPath)
  tooling/
    playwright-web/         # E2E test suite for apps/web
  docs/                     # Project-wide documentation
```

### Where shared code lives

Code reusable across apps belongs in `packages/`. Each package exports through
explicit entry points in its `package.json`:

```jsonc
// packages/ui/package.json (example)
"exports": {
  "./components/*": "./src/components/*.tsx",
  "./globals.css":  "./src/styles/globals.css",
  "./hooks/*":      "./src/hooks/*.ts",
  "./lib/*":        "./src/lib/*.ts"
}
```

Apps import from packages using workspace aliases:

```ts
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";
import { NonceProvider } from "@workspace/security/nonce-provider";
```

**What goes where:**

| Concern                | Location                         | Examples                        |
| ---------------------- | -------------------------------- | ------------------------------- |
| UI primitives (shadcn) | `packages/ui/src/components/`    | button, input, dialog           |
| Shared hooks           | `packages/ui/src/hooks/`         | use-mobile, use-toast           |
| Styling utilities      | `packages/ui/src/lib/`           | `cn()` (clsx + tailwind-merge)  |
| Global CSS + theme     | `packages/ui/src/styles/`        | Tailwind config, CSS variables  |
| Security middleware    | `packages/security/src/`         | CSP nonce, helmet headers       |
| Generic utilities      | `packages/utils/src/`            | async-pipe, type helpers        |
| TypeScript presets     | `packages/typescript-config/`    | base, react-library, playwright |
| E2E test helpers       | `packages/playwright-utilities/` | getJson, getPath                |
| E2E test suites        | `tooling/playwright-web/tests/`  | landing-page.spec.ts            |

### E2E tests in `tooling/`

E2E test suites live in `tooling/`, separate from the apps they test. This
keeps Playwright dependencies out of app bundles and lets the test suite depend
on both the app and shared test utilities:

```
tooling/
  playwright-web/
    tests/                  # Test files mirroring app routes
      landing-page.spec.ts
      auth/
      onboarding/
    playwright.config.ts    # Chromium, base URL, web server command
```

The Playwright config starts the app server automatically and points at the
Portless URL (`https://web.localhost`).

---

## App layout

Inside `apps/web/`, the `app/` directory holds all application code:

```
apps/web/
  app/
    components/             # App-specific shared components (logo, etc.)
    hooks/                  # App-specific hooks
    locales/                # i18n translations, one folder per language
    middleware/             # React Router middleware (i18n, auth, etc.)
    routes/                 # All route modules, grouped by layout
      api/                  # API-only routes (no UI)
      _[layout]/            # Layout groups (underscore prefix)
        +/                  # Private route helpers, colocated
        _layout.tsx         # Layout wrapper component
        [page].tsx          # Page route
    styles/                 # App-specific CSS (font faces, etc.)
    tests/                  # Shared test setup, mocks, utilities
    utils/                  # App-specific server/client utilities
    entry.client.tsx        # Client entry point
    entry.server.tsx        # Server entry point
    root.tsx                # Root layout
    routes.ts               # Route configuration
  docs/                     # App-specific documentation
  public/                   # Static assets (favicon, fonts, images)
  scripts/                  # One-off scripts (DB wipe, seed, etc.)
```

Note: there's no `components/ui/` inside the app. Shadcn primitives live in
`packages/ui/src/components/` and are imported as
`@workspace/ui/components/button`. The app's `components/` folder holds
only app-specific shared components (like a logo or avatar upload).

Similarly, generic hooks and utilities go in `packages/ui` or `packages/utils`.
The app's `hooks/` and `utils/` folders hold only code specific to this app.

## Routing with React Router Auto Routes

Routes are defined automatically from the file system using
[react-router-auto-routes](https://github.com/kenn/react-router-auto-routes).
No manual route config needed; the folder structure _is_ the route config:

```ts
// app/routes.ts
import { autoRoutes } from "react-router-auto-routes";

export default autoRoutes();
```

### Quick reference

| Pattern           | Meaning                                      | Example                            |
| ----------------- | -------------------------------------------- | ---------------------------------- |
| `index.tsx`       | Index route (default page for a folder)      | `blog/index.tsx` -> `/blog`        |
| `_layout.tsx`     | Shared layout wrapper (renders `<Outlet />`) | `blog/_layout.tsx` wraps `/blog/*` |
| `_` prefix folder | Pathless layout group (no URL segment added) | `_auth/login.tsx` -> `/login`      |
| `$param`          | Dynamic segment                              | `$slug.tsx` -> `/blog/:slug`       |
| `$.tsx`           | Catch-all (splat)                            | `files/$.tsx` -> `/files/*`        |
| `+` prefix        | Colocated non-route file (ignored by router) | `+/helpers.ts`, `+login.test.ts`   |

**Key insight:** folders are organization only. Without a `_layout.tsx`, the
folder adds a URL segment but no nesting. `api/users.ts` and `api.users.ts`
both create a route at `/api/users`.

See the [full docs](https://github.com/kenn/react-router-auto-routes/blob/main/README.md)
for configuration options, monorepo sub-app mounting, and migration from
remix-flat-routes.

## Conventions

### Colocation with `+` prefix

Route- or feature-specific helpers, components, and tests live next to their route files
using the `+` prefix. The router ignores anything starting with `+`.

Use a `+/` folder for multiple colocated files, or a `+` file prefix for
single files like tests:

```
routes/
  _auth/
    +/
      email-otp-cookie.server.ts   # Only used by auth routes
      use-countdown.ts
      use-countdown.test.ts
    +login.test.ts                 # Test for login.tsx (+ prefix = ignored)
    login.tsx
    register.tsx
    verify.tsx
```

A `+/` folder can contain sub-folders when a feature has many related files:

```
routes/
  _protected/organizations/$organizationSlug/
    +/
      notifications/               # Feature folder within +/
        notification-components.tsx
        notifications-model.server.ts
        notifications-schemas.ts
      sidebar-layout/              # Another feature folder
        app-sidebar.tsx
        nav-group.tsx
```

### Layout groups with `_` prefix

Directories prefixed with `_` create pathless layout boundaries. The
`_layout.tsx` inside wraps all sibling routes without adding a URL segment.

```
routes/
  _landing/           # No /landing in URL
    _layout.tsx       # Shared header/footer for landing pages
    index.tsx         # /
    privacy.tsx       # /privacy
    terms.tsx         # /terms
  _auth/              # No /auth in URL
    _layout.tsx       # Centered card layout
    login.tsx         # /login
    register.tsx      # /register
  _protected/         # No /protected in URL
    _layout.tsx       # Checks session, redirects if unauthenticated
    onboarding/       # /onboarding/*
    organizations/    # /organizations/*
```

### File suffixes

- **`.server.ts`** / **`.server.tsx`** -- Server-only code. The bundler
  tree-shakes these from the client bundle.
- **`.test.ts`** / **`.test.tsx`** -- Unit/integration tests (Vitest or
  bun:test). Colocated next to the source file.
- **`.e2e.ts`** / **`.spec.ts`** -- Playwright end-to-end tests. Live in
  `tooling/playwright-web/tests/`.

### Test structure

Tests follow two patterns:

**Colocated unit tests** sit next to their source file:

```
app/utils/env.server.ts
app/utils/env.server.test.ts
app/routes/_auth/+/use-countdown.ts
app/routes/_auth/+/use-countdown.test.ts
```

**E2E tests** live in `tooling/playwright-web/tests/`, mirroring app routes:

```
tooling/playwright-web/tests/
  landing-page.spec.ts
  auth/
    login.e2e.ts
    register.e2e.ts
  onboarding/
    user.e2e.ts
```

**Shared test utilities** live in `app/tests/`:

```
app/tests/
  mocks/                   # MSW handlers, fixtures
    handlers/
    fixtures/
  setup-test-env.ts        # Global test setup
  react-test-utils.tsx     # Render helpers for component tests
  test-utils.ts            # General test helpers
```

### Locales

One folder per language, with namespace files matching feature areas:

```
app/locales/
  en/
    index.ts               # Re-exports all namespaces
    translation.ts         # Default/common translations
    landing.ts
  de/
    index.ts
    translation.ts
    landing.ts
  index.ts                 # Locale configuration
```

### Package dependency graph

```
apps/web
  depends on @workspace/ui         (components, hooks, styles)
  depends on @workspace/security   (CSP nonce, security headers)

tooling/playwright-web
  depends on @workspace/playwright-utilities  (test helpers)
  depends on web                              (starts the app server)

packages/ui       depends on @workspace/typescript-config
packages/utils    depends on @workspace/typescript-config
packages/security depends on @workspace/typescript-config
```

---

<details>
<summary>Full project tree</summary>

```
.
├── README.md
├── TODO.md
├── apps
│   └── web
│       ├── Dockerfile
│       ├── README.md
│       ├── app
│       │   ├── entry.client.tsx
│       │   ├── entry.server.tsx
│       │   ├── locales
│       │   │   ├── de
│       │   │   │   ├── index.ts
│       │   │   │   ├── landing.ts
│       │   │   │   └── translation.ts
│       │   │   ├── en
│       │   │   │   ├── index.ts
│       │   │   │   ├── landing.ts
│       │   │   │   └── translation.ts
│       │   │   └── index.ts
│       │   ├── middleware
│       │   │   └── i18next.ts
│       │   ├── root.tsx
│       │   ├── routes
│       │   │   ├── api.locales.$lng.$ns.ts
│       │   │   └── index.tsx
│       │   ├── routes.ts
│       │   ├── styles
│       │   │   └── fonts.css
│       │   ├── utils
│       │   │   └── env.server.ts
│       │   └── welcome
│       │       ├── logo-dark.svg
│       │       ├── logo-light.svg
│       │       └── welcome.tsx
│       ├── components.json
│       ├── package.json
│       ├── public
│       │   ├── favicon.ico
│       │   └── fonts
│       │       └── inter
│       ├── react-router.config.ts
│       ├── tsconfig.json
│       ├── turbo.json
│       └── vite.config.ts
├── bun.lock
├── commitlint.config.ts
├── docs
│   └── app-structure.md
├── oxlint.config.mjs
├── package.json
├── packages
│   ├── playwright-utilities
│   │   ├── package.json
│   │   ├── src
│   │   │   └── helpers
│   │   │       ├── getJson.ts
│   │   │       └── getPath.ts
│   │   └── tsconfig.json
│   ├── security
│   │   ├── README.md
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── nonce-provider.ts
│   │   │   └── security-middleware.server.ts
│   │   └── tsconfig.json
│   ├── typescript-config
│   │   ├── base.json
│   │   ├── package.json
│   │   ├── playwright.json
│   │   ├── react-library.json
│   │   └── react-router.json
│   ├── ui
│   │   ├── components.json
│   │   ├── package.json
│   │   ├── postcss.config.mjs
│   │   ├── src
│   │   │   ├── components
│   │   │   │   ├── button.tsx
│   │   │   │   └── direction.tsx
│   │   │   ├── hooks
│   │   │   ├── lib
│   │   │   │   └── utils.ts
│   │   │   └── styles
│   │   │       └── globals.css
│   │   └── tsconfig.json
│   └── utils
│       ├── package.json
│       ├── src
│       │   ├── async-pipe.test.ts
│       │   ├── async-pipe.ts
│       │   └── types.ts
│       └── tsconfig.json
├── tooling
│   └── playwright-web
│       ├── package.json
│       ├── playwright.config.ts
│       ├── tests
│       │   └── landing-page.spec.ts
│       ├── tsconfig.json
│       └── turbo.json
├── tsconfig.json
└── turbo.json

34 directories, 87 files
```

</details>
