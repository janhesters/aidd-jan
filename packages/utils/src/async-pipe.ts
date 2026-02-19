/* oxlint-disable @typescript-eslint/no-explicit-any -- required for type-level function composition */
/* oxlint-disable @typescript-eslint/no-non-null-assertion -- safe after length checks */

// A type that represents either a value or a promise of that value.
type MaybePromise<T> = T | Promise<T>;

// An async (or sync) function that may return a Promise.
type AsyncFn = (...args: Array<any>) => MaybePromise<any>;

// A unary async (or sync) function.
type AsyncUnaryFn = (arg: any) => MaybePromise<any>;

/**
 * Recursively validates a pipeline of functions, ensuring each function's
 * input type matches the Awaited output type of the previous function.
 *
 * Returns a "corrected" tuple where each function is constrained to
 * accept the correct input. When intersected with the original tuple
 * (`Fns & ValidAsyncPipeline<Fns>`), any type mismatch produces a
 * compile-time error.
 */
type ValidAsyncPipeline<Fns extends readonly AsyncFn[]> = Fns extends []
  ? []
  : Fns extends [infer Only]
    ? [Only]
    : Fns extends [
          infer First extends AsyncFn,
          infer Second extends AsyncFn,
          ...infer Rest extends AsyncFn[],
        ]
      ? First extends (...args: Array<any>) => MaybePromise<infer B>
        ? [First, ...ValidAsyncPipeline<[(arg: Awaited<B>) => ReturnType<Second>, ...Rest]>]
        : never
      : never;

/** Extract the Awaited return type of the last function in a tuple. */
type LastReturnType<Fns extends readonly AsyncFn[]> = Fns extends [
  ...any[],
  (...args: Array<any>) => infer R,
]
  ? Awaited<R>
  : never;

/**
 * Pipe asynchronous (or synchronous) functions from left to right.
 *
 * Uses recursive conditional types to support pipelines of **any length**
 * with full type inference — no arbitrary overload limit.
 *
 * The first function can accept multiple arguments; all subsequent
 * functions must be unary (receiving the previous function's output).
 *
 * All results are automatically awaited between steps, so you can freely
 * mix sync and async functions.
 *
 * @example
 * ```typescript
 * const composed = asyncPipe(
 *   async (x: number) => x * 2,
 *   async (x: number) => x + 1,
 *   (x: number) => x.toString(),
 * );
 * await composed(10); // "21"
 *
 * // Multi-arg first function
 * const greet = asyncPipe(
 *   (first: string, last: string) => `${first} ${last}`,
 *   async (name: string) => `Hello, ${name}!`,
 * );
 * await greet("Jane", "Doe"); // "Hello, Jane Doe!"
 * ```
 */
export function asyncPipe(): <T>(x: T) => Promise<T>;
export function asyncPipe<const Fns extends [AsyncFn, ...AsyncUnaryFn[]]>(
  ...fns: Fns & ValidAsyncPipeline<Fns>
): Fns extends [(...args: infer A) => any, ...any[]]
  ? (...args: A) => Promise<LastReturnType<Fns>>
  : never;
export function asyncPipe(...fns: Array<AsyncFn>): (...args: Array<any>) => Promise<any> {
  if (fns.length === 0) {
    return (x: any) => Promise.resolve(x);
  }

  if (fns.length === 1) {
    return (...args: Array<any>) => Promise.resolve(fns[0]!(...args));
  }

  return (...args: Array<any>) => {
    const [first, ...rest] = fns;
    return rest.reduce(
      (chain, fn) => chain.then((result) => fn(result)),
      Promise.resolve(first!(...args)),
    );
  };
}
