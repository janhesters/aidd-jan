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

    const actual1 = result.current.secondsLeft;
    const expected1 = 3;

    expect(actual1).toEqual(expected1);

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    const actual2 = result.current.secondsLeft;
    const expected2 = 2;

    expect(actual2).toEqual(expected2);

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    const actual3 = result.current.secondsLeft;
    const expected3 = 1;

    expect(actual3).toEqual(expected3);

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    const actual4 = result.current.secondsLeft;
    const expected4 = 0;

    expect(actual4).toEqual(expected4);
  });

  test("given: a countdown reaching zero, should: stop at zero and not continue", () => {
    const { result } = setup(2);

    const actual1 = result.current.secondsLeft;
    const expected1 = 2;

    expect(actual1).toEqual(expected1);

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    const actual2 = result.current.secondsLeft;
    const expected2 = 0;

    expect(actual2).toEqual(expected2);

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    const actual3 = result.current.secondsLeft;
    const expected3 = 0;

    expect(actual3).toEqual(expected3);
  });

  test("given: a new initial time value, should: reset the countdown to the new value", () => {
    const { result, rerender } = setupWithProps({ initialSeconds: 5 });

    const actual1 = result.current.secondsLeft;
    const expected1 = 5;

    expect(actual1).toEqual(expected1);

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    const actual2 = result.current.secondsLeft;
    const expected2 = 3;

    expect(actual2).toEqual(expected2);

    rerender({ initialSeconds: 10 });
    const actual3 = result.current.secondsLeft;
    const expected3 = 10;

    expect(actual3).toEqual(expected3);
  });

  test("given: zero initial value, should: remain at zero without counting", () => {
    const { result } = setup(0);

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    const actual = result.current.secondsLeft;
    const expected = 0;

    expect(actual).toEqual(expected);
  });

  test("given: negative initial value, should: remain at the negative value without counting", () => {
    const { result } = setup(-5);

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    const actual = result.current.secondsLeft;
    const expected = -5;

    expect(actual).toEqual(expected);
  });

  test("given: component unmounting, should: stop counting and maintain last value", () => {
    const { result, unmount } = setup(5);

    const actual1 = result.current.secondsLeft;
    const expected1 = 5;

    expect(actual1).toEqual(expected1);

    unmount();

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    const actual2 = result.current.secondsLeft;
    const expected2 = 5;

    expect(actual2).toEqual(expected2);
  });

  test("given: reset function is called, should: reset the timer back to initialSeconds", () => {
    const { result } = setup(10);

    const actual1 = result.current.secondsLeft;
    const expected1 = 10;

    expect(actual1).toEqual(expected1);

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    const actual2 = result.current.secondsLeft;
    const expected2 = 7;

    expect(actual2).toEqual(expected2);

    act(() => {
      result.current.reset();
    });
    const actual3 = result.current.secondsLeft;
    const expected3 = 10;

    expect(actual3).toEqual(expected3);
  });

  test("given: reset function is called after countdown reaches zero, should: restart the countdown", () => {
    const { result } = setup(3);

    const actual1 = result.current.secondsLeft;
    const expected1 = 3;

    expect(actual1).toEqual(expected1);

    act(() => {
      jest.advanceTimersByTime(4000);
    });
    const actual2 = result.current.secondsLeft;
    const expected2 = 0;

    expect(actual2).toEqual(expected2);

    act(() => {
      result.current.reset();
    });
    const actual3 = result.current.secondsLeft;
    const expected3 = 3;

    expect(actual3).toEqual(expected3);

    act(() => {
      jest.advanceTimersByTime(1000);
    });
    const actual4 = result.current.secondsLeft;
    const expected4 = 2;

    expect(actual4).toEqual(expected4);
  });
});
