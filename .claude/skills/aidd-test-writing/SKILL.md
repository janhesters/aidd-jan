---
name: aidd-test-writing
description: Write unit, functional, integration, and E2E tests following RITEway principles (Readable, Isolated, Thorough, Explicit). Use when the user asks to write tests, add test coverage, create a test suite, or test a function/module/component/page. Supports Vitest, bun:test, and Playwright.
---

# Test Writer

constraint FrameworkDetection {
  Check the project's package.json to determine the test framework.
  match (dependencies) {
    case (vitest installed) => import from "vitest"
    case (bun-types installed, no vitest) => import from "bun:test"
    default => ask the user which framework to use
  }
}

TestStructure {
  Every test file must answer 5 questions {
    1. What is the unit under test? — named `describe` block with function name + `()`
    2. What is the expected behavior? — `test` string: "given [condition]: [expected result]"
    3. What is the actual output? — `actual` variable from exercising the unit
    4. What is the expected output? — `expected` variable with the correct value
    5. How can we find the bug? — implicitly answered when 1–4 are clear
  }

  Constraints {
    Use `test`, never `it`.
    For unit/integration tests: declare `actual` and `expected` as separate
    variables, then `expect(actual).toEqual(expected)`.
    Always use `toEqual` — never `toBe`, `toStrictEqual`, or other matchers
    for value comparison. Use `toMatchObject` or `expect.any(Constructor)` only
    when `toEqual` isn't possible (e.g. randomly generated dates or IDs).
    Whitespace: empty line before `actual` only when there is setup code above
    it in the same test. No empty line between `actual` and `expected`. Empty
    line after `expected` before `expect`.
    For functional tests: inline assertions with `toBeInTheDocument()`,
    `toHaveAttribute()`, etc. are acceptable — see functional-tests reference.
    Colocate test files with the code they test (e.g. `foo.ts` → `foo.test.ts`).
    Import the function/component under test.
  }
}

RITE {
  Tests must be:
  - Readable - Answer the 5 questions.
  - Isolated/Integrated
    - Units under test should be isolated from each other
    - Tests should be isolated from each other with no shared mutable state.
    - For integration tests, test integration with the real system.
  - Thorough - Test expected/very likely edge cases
  - Explicit - Everything you need to know to understand the test should be part of the test itself. If you need to produce the same data structure many times for many test cases, create a factory function and invoke it from the individual tests, rather than sharing mutable fixtures between tests.

  Constraints {
    Avoid using `beforeEach`, `beforeAll`, `afterEach`, `afterAll`.
    - Exception: global setup like MSW server start/stop.
    Use `onTestFinished` inside a local `setup()` function for cleanup.
    Use factory functions to create test data per test — no shared fixtures.
    See [references/factories.sudo.md](references/factories.sudo.md) for factory patterns.
    Do not test types or shapes — that is redundant with TypeScript.
  }
}

TestType {
  select(task) => match (task) {
    case (pure function, no I/O, no side effects) =>
      Unit test — see [references/unit-tests.sudo.md](references/unit-tests.sudo.md)
    case (React component, UI rendering, user interaction) =>
      Functional test — see [references/functional-tests.sudo.md](references/functional-tests.sudo.md)
    case (database, filesystem, network, real external system) =>
      Integration test — see [references/integration-tests.sudo.md](references/integration-tests.sudo.md)
    case (full user flow, real browser, page navigation, cross-page) =>
      E2E test — see [references/e2e-tests.sudo.md](references/e2e-tests.sudo.md)
  }
}

Mocking {
  Constraints {
    Only mock what you must — prefer testing with real dependencies.
    For unit tests: use `vi.fn()` / `mock()` for injected dependencies.
    For integration tests: test against the real system, not mocks.
    Use `vi.mock` with `vi.importActual` for partial module mocks (Vitest only).
  }
}
