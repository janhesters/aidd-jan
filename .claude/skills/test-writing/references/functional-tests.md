# Functional Test Examples

FunctionalTest {
  Tests a React component in isolation by rendering it and asserting on the
  rendered output and user interactions.

  Constraints {
    Import from shared test-utils files (e.g. `~/test/react-test-utils`) if they
    exist in the project, instead of directly from `@testing-library/react`.
    Use `userEvent` for simulating interactions — not `fireEvent`.
    Query by accessible role first (`getByRole`), then by text (`getByText`).
    Name the `describe` block after the component: `"ComponentName component"`.
    Use `test` string pattern: `"given: [condition], should: [behavior]"`.
    Create a `createProps` factory for the component's props.
    Use `createRoutesStub` when the component needs router context.
    Use `test.each` for parameterized tests over multiple variants.
  }
}

## Simple Example

```ts
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Greeting } from "./greeting";

describe("Greeting component", () => {
  test("given: default props, should: render heading and description", () => {
    render(<Greeting />);

    expect(
      screen.getByRole("heading", { name: /hello world/i }),
    ).toBeInTheDocument();

    expect(screen.getByText(/some description/i)).toBeInTheDocument();
  });
});
```

## Realistic Example with Props Factory and Router

```ts
import { href } from "react-router";
import { describe, expect, test, vi } from "vitest";

import type { SubscriptionModalProps } from "./subscription-modal";
import { SubscriptionModal } from "./subscription-modal";
import {
  createRoutesStub,
  render,
  screen,
  userEvent,
} from "~/test/react-test-utils";
import type { Factory } from "~/utils/types";

const createProps: Factory<SubscriptionModalProps> = ({
  canCancel = false,
  currentTier = "low",
  currentInterval = "annual" as const,
  onCancelClick = vi.fn(),
} = {}) => ({
  canCancel,
  currentInterval,
  currentTier,
  onCancelClick,
});

describe("SubscriptionModal component", () => {
  test("given: user is on low tier, should: show current plan and upgrade buttons", () => {
    const props = createProps({ currentTier: "low" });
    const RouterStub = createRoutesStub([
      {
        Component: () => <SubscriptionModal {...props} />,
        path: "/",
      },
    ]);

    render(<RouterStub initialEntries={["/"]} />);

    expect(
      screen.getByRole("button", { name: /current plan/i }),
    ).toBeDisabled();
    expect(screen.getAllByRole("button", { name: /upgrade/i })).toHaveLength(2);
    expect(
      screen.getByRole("link", { name: /contact sales/i }),
    ).toHaveAttribute("href", href("/contact-sales"));
  });

  test("given: any props, should: allow switching between monthly and annual tabs", async () => {
    const user = userEvent.setup();
    const props = createProps();
    const RouterStub = createRoutesStub([
      {
        Component: () => <SubscriptionModal {...props} />,
        path: "/",
      },
    ]);

    render(<RouterStub initialEntries={["/"]} />);

    expect(screen.getByRole("tab", { name: /annual/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await user.click(screen.getByRole("tab", { name: /monthly/i }));
    expect(screen.getByRole("tab", { name: /monthly/i })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
```

## Parameterized Example

```ts
test.each([
  "low",
  "mid",
  "high",
] as const)("given: user is on %s tier monthly, should: show switch-to-annual button", (currentTier) => {
  const props = createProps({ currentTier, currentInterval: "monthly" });
  const RouterStub = createRoutesStub([
    {
      Component: () => <SubscriptionModal {...props} />,
      path: "/",
    },
  ]);

  render(<RouterStub initialEntries={["/"]} />);

  expect(
    screen.getByRole("button", { name: /switch to annual/i }),
  ).toBeInTheDocument();
});
```

## Patterns

PropsFactory {
  Create a `createProps` factory per component test file.
  Use `Factory<ComponentProps>` type.
  Use `vi.fn()` for callback prop defaults.
  Each test overrides only what it cares about.
}

QueryPriority {
  1. `getByRole` — accessible, resilient to markup changes
  2. `getByText` — for content assertions
  3. `queryByRole` / `queryByText` — for asserting absence
  Avoid `getByTestId` unless no accessible alternative exists.
}
