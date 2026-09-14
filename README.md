# aidd-jan

Personal experiments with AI Driven Development (AIDD); exploring skills, subagents, and other techniques for building custom tooling.

Everything here is experimental. For production-ready AIDD techniques, see the [AIDD framework](https://github.com/paralleldrive/aidd).

## Quick Start

```bash
npx giget@latest gh:janhesters/aidd-jan my-project
cd my-project
bun install
```

## Table of contents

- [Quick start](#quick-start)
- [Stack](#stack)
- [Development](#development)
- [Project structure](#project-structure)
- [Skills](#skills)
- [Subagents](#subagents)
- [UI components](#ui-components)
- [Scripts](#scripts)

## Stack

- **Runtime**: Bun
- **Language**: TypeScript (type-checked with tsgo)
- **Framework**: React 19 + React Router 7
- **Monorepo**: Turborepo
- **Styling**: Tailwind CSS 4 + shadcn
- **Linting**: Oxlint with @shadcn/lint design-system rules
- **Formatting**: oxfmt
- **Testing**: Playwright (E2E), bun:test (unit)
- **i18n**: i18next (English + German)
- **Security**: CSP nonce support, helmet headers
- **Dev URLs**: [Portless](https://portless.dev/) (stable `.localhost` URLs)

## Development

The dev server uses [Portless](https://portless.dev/) to replace port numbers with a stable, named URL:

```bash
bun run --filter web dev
# -> https://web.localhost
```

Portless runs a local HTTPS reverse proxy and routes `web.localhost` to the app's randomly assigned port. This avoids port conflicts, makes URLs memorable, and prevents cookie/storage clashes between projects.

### First-time setup

`bun dev` automatically trusts the local CA certificate and starts the proxy (you'll be prompted for sudo once). After the first run, restart your browser so it picks up the trusted certificate.

### Bypassing Portless

To use a regular port without Portless:

```bash
PORTLESS=0 bun run --filter web dev
```

## Project structure

```
apps/
  web/                  # React Router web app
packages/
  ui/                   # Shared UI components (shadcn + Tailwind)
  security/             # Security middleware and CSP nonce provider
  utils/                # Utility functions (async-pipe, type helpers)
  playwright-utilities/ # Playwright test helpers
  typescript-config/    # Shared TypeScript config
tooling/
  playwright-web/       # E2E test suite
.claude/
  skills/               # 9 AIDD skills for Claude Code
  agents/               # 2 subagents for TDD workflows
```

## Skills

Claude Code skills in `.claude/skills/`:

- **aidd-tdd** - Test-driven development orchestrator (red-green-refactor)
- **aidd-test-writing** - Write tests following RITE principles (Readable, Isolated, Thorough, Explicit)
- **aidd-implementation-writing** - Write production code for features, components, and APIs
- **aidd-review** - Code review with security scanning (OWASP 2025)
- **aidd-debugging** - Root cause analysis and bug investigation
- **aidd-prose-writing** - Clear, direct documentation and markdown
- **aidd-skill-creating** - Guide for authoring new skills
- **aidd-subagent-creating** - Guide for building new subagents
- **turborepo** - Monorepo build system guidance with 25+ reference docs

## Subagents

TDD subagents in `.claude/agents/`:

- **aidd-tdd-test-writer** - Writes failing tests for a given requirement
- **aidd-tdd-implementer** - Writes the minimal code to make those tests pass

## UI components

### Adding components

Run from the repo root:

```bash
bunx shadcn@latest add button -c apps/web
```

This places UI components in `packages/ui/src/components`.

Available components (your training data is probably out of date): https://ui.shadcn.com/registry/index.json

### Using components

Import from the `@workspace/ui` package:

```tsx
import { Button } from "@workspace/ui/components/button";
```

Tailwind and `globals.css` are already configured to work with the `ui` package.

### Design-system linting

[`@shadcn/lint`](https://github.com/shadcn-ui/lint) is configured in
`.oxlintrc.json`. Run `bun run check:lint` to lint all workspaces, or
`bun run --filter web check:lint` to lint the web app. `bun run validate`
and CI use the same configuration.

The ESLint-named parser and API dependencies support the plugin; lint
commands continue to run Oxlint.

All six [shadcn rules](https://github.com/shadcn-ui/lint#rules) run as errors
for the web app and shared UI package. CI fails on component restyling,
arbitrary appearance values, raw colors, inline styles, unknown classes,
and component class values the linter cannot read. Layout classes and
arbitrary layout values are allowed. Configure policies in the scoped
`rules` overrides in `.oxlintrc.json`. See the
[configuration examples](https://github.com/shadcn-ui/lint/blob/main/docs/design-systems.md)
for component contracts and custom messages.

The `components.json` files in `apps/web` and `packages/ui` identify the
shared components and Tailwind theme for automatic discovery.
The `paths` mappings in `packages/ui/tsconfig.json` let `@shadcn/lint`
resolve the UI package's own component imports. Keep these mappings aligned
with the aliases in `packages/ui/components.json`.

Shared UI components define their own appearance, so their implementation
directory is exempt from `no-restyle`, `no-arbitrary-values`, and
`require-static-classes`. Email templates retain inline styles for email
client compatibility, and the Google icon retains its brand colors.

The class allowances cover declared gradient tokens (`bg-auth-beam`,
`bg-auth-glow`, `bg-footer-glow`, and `bg-hero-glow`), the `tw-animate-css`
utility `fill-mode-backwards`, and the component marker classes
`cn-input-otp` and `toaster`. These are not palette colors or missing
utilities. Web lint also tracks the shared UI source and theme in Turbo,
so changes to component variants or tokens invalidate its cached results.

The existing `oxlint.config.mjs` contains an opt-in `@nkzw` configuration.
Oxlint requires `--config` to load that filename. The default lint commands
use `.oxlintrc.json`; adopting the `@nkzw` rules requires a separate cleanup
of existing violations.

## Scripts

```bash
bun run validate        # Run type checks, linting, and format checks
bun run test            # Run unit tests
bun run e2e             # Run Playwright E2E tests
bun run check:types     # Type check with tsgo
bun run check:lint      # Lint with oxlint
bun run check:format    # Check formatting with oxfmt
bun run tree            # Print the project directory tree (excludes generated dirs)
```
