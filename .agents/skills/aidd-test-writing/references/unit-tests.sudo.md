# Unit Test Examples

UnitTest {
  Tests a single function or module in isolation.
  No I/O, no network, no database — pure logic.

  Constraints {
    Import the function under test — never define it inline in the test file.
    One `describe` block per function, named after the function with parentheses.
    Each `test` string follows the pattern: "given [condition]: [expected result]".
    Declare `actual` and `expected` variables explicitly before asserting.
    Use `expect(actual).toEqual(expected)` for value comparison.
    Use cuid2 for IDs in test data unless specified otherwise.
  }
}

## Vitest Example

```ts
import { describe, expect, test } from "vitest";

import { add } from "./add.ts";

describe("add()", () => {
  test("given two positive numbers: returns the sum", () => {
    const actual = add(1, 2);
    const expected = 3;

    expect(actual).toEqual(expected);
  });

  test("given a negative and a positive number: returns the difference", () => {
    const actual = add(-1, 3);
    const expected = 2;

    expect(actual).toEqual(expected);
  });
});
```

## bun:test Example

```ts
import { describe, expect, test } from "bun:test";

import { add } from "./add.ts";

describe("add()", () => {
  test("given two positive numbers: returns the sum", () => {
    const actual = add(1, 2);
    const expected = 3;

    expect(actual).toEqual(expected);
  });
});
```

## Example with Setup Code

```ts
import { describe, expect, test } from "vitest";

import { asyncPipe } from "./async-pipe.server";

const asyncInc = async (x: number) => x + 1;
const asyncDouble = async (x: number) => x * 2;

describe("asyncPipe()", () => {
  test("given: two promise returning functions, should: compose them", async () => {
    const asyncDoubleInc = asyncPipe(asyncDouble, asyncInc);

    const actual = await asyncDoubleInc(10);
    const expected = 21;

    expect(actual).toEqual(expected);
  });
});
```

Note: empty line before `actual` because there is setup code (`asyncDoubleInc`) above it.

## Mocking Example (Vitest)

```ts
import { describe, expect, test, vi } from "vitest";

import { greet } from "./greet.ts";

describe("greet()", () => {
  test("given a name: calls the logger with a greeting", () => {
    const logger = vi.fn();
    greet("Alice", logger);

    const actual = logger.mock.calls[0][0];
    const expected = "Hello, Alice!";

    expect(actual).toEqual(expected);
  });
});
```
