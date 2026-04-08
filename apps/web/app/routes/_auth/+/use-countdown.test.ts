import {
  afterAll,
  beforeAll,
  describe,
  expect,
  jest,
  onTestFinished,
  test,
} from "bun:test";

import { GlobalRegistrator } from "@happy-dom/global-registrator";

import { act, renderHook } from "~/tests/react-test-utils";

import { useCountdown } from "./use-countdown";

describe("useCountdown()", () => {
  beforeAll(() => {
    GlobalRegistrator.register();
  });

  afterAll(async () => {
    await GlobalRegistrator.unregister();
  });

  function setup(initialSeconds: number) {
    jest.useFakeTimers();
    onTestFinished(() => jest.useRealTimers());
    return renderHook(() => useCountdown(initialSeconds));
  }

  function setupWithProps(initialProps: { initialSeconds: number }) {
    jest.useFakeTimers();
    onTestFinished(() => jest.useRealTimers());
    return renderHook(({ initialSeconds }) => useCountdown(initialSeconds), {
      initialProps,
    });
  }

  test("given: an initial time in seconds, should: initialize with that value", () => {
    const { result } = setup(60);

    const actual = result.current.secondsLeft;
    const expected = 60;
    expect(actual).toEqual(expected);
  });

  test("given: an initial time greater than zero, should: count down every second until zero", () => {
    const { result } = setup(3);

    expect(result.current.secondsLeft).toEqual(3);

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.secondsLeft).toEqual(2);

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.secondsLeft).toEqual(1);

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    const actual = result.current.secondsLeft;
    const expected = 0;
    expect(actual).toEqual(expected);
  });

  test("given: a countdown reaching zero, should: stop at zero and not continue", () => {
    const { result } = setup(2);

    expect(result.current.secondsLeft).toEqual(2);

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(result.current.secondsLeft).toEqual(0);

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    const actual = result.current.secondsLeft;
    const expected = 0;
    expect(actual).toEqual(expected);
  });

  test("given: a new initial time value, should: reset the countdown to the new value", () => {
    const { result, rerender } = setupWithProps({ initialSeconds: 5 });

    expect(result.current.secondsLeft).toEqual(5);

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.current.secondsLeft).toEqual(3);

    rerender({ initialSeconds: 10 });
    const actual = result.current.secondsLeft;
    const expected = 10;
    expect(actual).toEqual(expected);
  });

  test("given: zero or negative initial values, should: remain at the initial value without counting", () => {
    const { result: zeroResult } = setup(0);
    expect(zeroResult.current.secondsLeft).toEqual(0);

    const { result: negativeResult } = setup(-5);
    expect(negativeResult.current.secondsLeft).toEqual(-5);

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(zeroResult.current.secondsLeft).toEqual(0);

    const actual = negativeResult.current.secondsLeft;
    const expected = -5;
    expect(actual).toEqual(expected);
  });

  test("given: component unmounting, should: stop counting and maintain last value", () => {
    const { result, unmount } = setup(5);

    expect(result.current.secondsLeft).toEqual(5);

    unmount();

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    const actual = result.current.secondsLeft;
    const expected = 5;
    expect(actual).toEqual(expected);
  });

  test("given: reset function is called, should: reset the timer back to initialSeconds", () => {
    const { result } = setup(10);

    expect(result.current.secondsLeft).toEqual(10);

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(result.current.secondsLeft).toEqual(7);

    act(() => {
      result.current.reset();
    });
    const actual = result.current.secondsLeft;
    const expected = 10;
    expect(actual).toEqual(expected);
  });

  test("given: reset function is called after countdown reaches zero, should: restart the countdown", () => {
    const { result } = setup(3);

    expect(result.current.secondsLeft).toEqual(3);

    act(() => {
      jest.advanceTimersByTime(4000);
    });
    expect(result.current.secondsLeft).toEqual(0);

    act(() => {
      result.current.reset();
    });
    expect(result.current.secondsLeft).toEqual(3);

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    const actual = result.current.secondsLeft;
    const expected = 2;
    expect(actual).toEqual(expected);
  });
});
