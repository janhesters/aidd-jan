# aidd-jan

Personal experiments with AI Driven Development (AIDD) — exploring skills, subagents, and other techniques for building custom tooling.

Everything here is experimental. For production-ready, battle-tested AIDD techniques, see the [AIDD framework](https://github.com/paralleldrive/aidd).

## UI Components

### Adding components

To add shadcn components, run the following from the repo root:

```bash
bunx shadcn@latest add button -c apps/web
```

This places UI components in `packages/ui/src/components`.

### Using components

Import components from the `@workspace/ui` package:

```tsx
import { Button } from "@workspace/ui/components/button"
```

Tailwind and `globals.css` are already configured to work with the `ui` package.
