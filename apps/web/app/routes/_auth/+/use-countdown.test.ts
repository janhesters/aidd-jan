import "~/tests/happy-dom";
import { afterEach, beforeEach, describe, expect, jest, test } from "bun:test";

import { act, renderHook } from "~/tests/react-test-utils";

import { useCountdown } from "./use-countdown";

describe("useCountdown()", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("given: an initial time in seconds, should: initialize with that value", () => {
    const { result } = renderHook(() => useCountdown(60));
    expect(result.current.secondsLeft).toEqual(60);
  });

  test("given: an initial time greater than zero, should: count down every second until zero", () => {
    const { result } = renderHook(() => useCountdown(3));

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
    expect(result.current.secondsLeft).toEqual(0);
  });

  test("given: a countdown reaching zero, should: stop at zero and not continue", () => {
    const { result } = renderHook(() => useCountdown(2));

    expect(result.current.secondsLeft).toEqual(2);

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(result.current.secondsLeft).toEqual(0);

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.current.secondsLeft).toEqual(0);
  });

  test("given: a new initial time value, should: reset the countdown to the new value", () => {
    const { result, rerender } = renderHook(
      ({ initialSeconds }) => useCountdown(initialSeconds),
      { initialProps: { initialSeconds: 5 } },
    );

    expect(result.current.secondsLeft).toEqual(5);

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.current.secondsLeft).toEqual(3);

    rerender({ initialSeconds: 10 });
    expect(result.current.secondsLeft).toEqual(10);
  });

  test("given: zero or negative initial values, should: remain at the initial value without counting", () => {
    const { result: zeroResult } = renderHook(() => useCountdown(0));
    expect(zeroResult.current.secondsLeft).toEqual(0);

    const { result: negativeResult } = renderHook(() => useCountdown(-5));
    expect(negativeResult.current.secondsLeft).toEqual(-5);

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(zeroResult.current.secondsLeft).toEqual(0);
    expect(negativeResult.current.secondsLeft).toEqual(-5);
  });

  test("given: component unmounting, should: stop counting and maintain last value", () => {
    const { result, unmount } = renderHook(() => useCountdown(5));

    expect(result.current.secondsLeft).toEqual(5);

    unmount();

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.current.secondsLeft).toEqual(5);
  });

  test("given: reset function is called, should: reset the timer back to initialSeconds", () => {
    const { result } = renderHook(() => useCountdown(10));

    expect(result.current.secondsLeft).toEqual(10);

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(result.current.secondsLeft).toEqual(7);

    act(() => {
      result.current.reset();
    });
    expect(result.current.secondsLeft).toEqual(10);
  });

  test("given: reset function is called after countdown reaches zero, should: restart the countdown", () => {
    const { result } = renderHook(() => useCountdown(3));

    expect(result.current.secondsLeft).toEqual(3);

    act(() => {
      jest.advanceTimersByTime(4000);
    });
    expect(result.current.secondsLeft).toEqual(0);

    act(() => {
      result.current.reset();
    });
    expect(result.current.secondsLeft).toEqual(3);

    // Verify countdown continues after reset
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.secondsLeft).toEqual(2);
  });
});
