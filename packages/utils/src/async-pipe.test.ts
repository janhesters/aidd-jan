import { describe, expect, test } from "bun:test";

import { asyncPipe } from "./async-pipe";

const asyncInc = async (x: number) => x + 1;
const asyncDouble = async (x: number) => x * 2;
const asyncToString = async (x: number) => x.toString();
const asyncShout = async (x: string) => `${x}!`;

describe("asyncPipe()", () => {
  test("given: two promise returning functions, should: compose them in left-to-right order", async () => {
    const asyncDoubleInc = asyncPipe(asyncDouble, asyncInc);

    const actual = await asyncDoubleInc(10);
    const expected = 21;

    expect(actual).toEqual(expected);
  });

  test("given: four promise returning functions with mixed types, should: compose them in left-to-right order", async () => {
    const asyncSquareHalveDoubleInc = asyncPipe(
      asyncDouble,
      asyncInc,
      asyncToString,
      asyncShout,
    );

    const actual = await asyncSquareHalveDoubleInc(10);
    const expected = "21!";

    expect(actual).toEqual(expected);
  });

  test("given: a multi-arg first function, should: pass all arguments to the first function and compose the rest", async () => {
    const greet = asyncPipe(
      (first: string, last: string) => `${first} ${last}`,
      async (name: string) => `Hello, ${name}!`,
    );

    const actual = await greet("Jane", "Doe");
    const expected = "Hello, Jane Doe!";

    expect(actual).toEqual(expected);
  });

  test("given: no functions, should: return an identity function that wraps the value in a promise", async () => {
    const identity = asyncPipe();

    const actual = await identity(42);
    const expected = 42;

    expect(actual).toEqual(expected);
  });
});
