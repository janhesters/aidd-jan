import { useCallback, useEffect, useRef, useState } from "react";

const ONE_SECOND = 1000;

/**
 * A React hook that provides a countdown timer functionality.
 *
 * @param initialSeconds - The initial number of seconds for the countdown.
 *
 * @returns An object containing:
 * - `secondsLeft`: The current number of seconds left in the countdown.
 * - `reset`: A function to reset the countdown to the initial seconds.
 */
export function useCountdown(initialSeconds: number) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const intervalIdReference = useRef<NodeJS.Timeout | undefined>(undefined);

  const clearCountdown = useCallback(() => {
    if (intervalIdReference.current) {
      clearInterval(intervalIdReference.current);
      intervalIdReference.current = undefined;
    }
  }, []);

  const startCountdown = useCallback(() => {
    clearCountdown();

    intervalIdReference.current = setInterval(() => {
      setSecondsLeft((previous) => {
        if (previous <= 1) {
          return 0;
        }
        return previous - 1;
      });
    }, ONE_SECOND);
  }, [clearCountdown]);

  const reset = useCallback(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) return clearCountdown();

    startCountdown();
    return clearCountdown;
  }, [secondsLeft, startCountdown, clearCountdown]);

  return { reset, secondsLeft };
}
