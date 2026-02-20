# aidd-jan

Personal experiments with AI Driven Development (AIDD); exploring skills, subagents, and other techniques for building custom tooling.

Everything here is experimental. For production-ready AIDD techniques, see the [AIDD framework](https://github.com/paralleldrive/aidd).

## Table of contents

- [Stack](#stack)
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
- **Linting**: oxlint (with @nkzw config)
- **Formatting**: oxfmt
- **Testing**: Playwright (E2E), bun:test (unit)
- **i18n**: i18next (English + German)
- **Security**: CSP nonce support, helmet headers

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

### Using components

Import from the `@workspace/ui` package:

```tsx
import { Button } from "@workspace/ui/components/button";
```

Tailwind and `globals.css` are already configured to work with the `ui` package.

## Scripts

```bash
bun run validate        # Run type checks, linting, and format checks
bun run test            # Run unit tests
bun run e2e             # Run Playwright E2E tests
bun run check:types     # Type check with tsgo
bun run check:lint      # Lint with oxlint
bun run check:format    # Check formatting with oxfmt
```
