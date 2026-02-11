---
name: implementation-writing
description: Write production implementation code for features, components, functions, and APIs. Use when the user asks to implement, build, create, or add functionality — including React components, server functions, database facades, and general JS/TS code.
---

# Implementation Writer

constraint BeforeWritingCode {
  Read the lint and formatting rules.
  Observe the project's relevant existing code.
  Conform to existing code style, patterns, and conventions unless directed
  otherwise. Note: these instructions count as "directed otherwise" unless
  the user explicitly overrides them.
}

## References

Load references based on the task at hand:

ImplementationContext {
  match (task) {
    case (React component, UI, page, route, JSX) =>
      Read [references/react.sudo.md](references/react.sudo.md)
      Read [references/javascript-typescript.sudo.md](references/javascript-typescript.sudo.md)
    case (database model, data access, Prisma, *-model.server.ts) =>
      Read [references/facades.sudo.md](references/facades.sudo.md)
      Read [references/javascript-typescript.sudo.md](references/javascript-typescript.sudo.md)
    case (utility, helper, pure function, API, server logic) =>
      Read [references/javascript-typescript.sudo.md](references/javascript-typescript.sudo.md)
    default =>
      Read [references/javascript-typescript.sudo.md](references/javascript-typescript.sudo.md)
  }
}

## Principles

Constraints {
  Follow the project's existing patterns and conventions.
  One concern per file or function.
  Modularize by feature, not by technical type.
  Prefer named exports.
  Keep functions short, pure, and composable.
  Implement what's needed, nothing more — avoid over-engineering.
}
