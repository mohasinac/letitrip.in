import { useCallback, useEffect, useRef, useState } from "react";

// Default delays (avoiding external dependency)
const DEFAULT_DEBOUNCE_DELAY = 300;
const DEFAULT_THROTTLE_INTERVAL = 200;

/**
 * Debounce hook - delays execution until after wait milliseconds have elapsed
 * since the last time the debounced function was invoked
 * 
 * @example
 * ```tsx
 * const debouncedSearch = useDebounce(searchTerm, 300);
 * 
 * useEffect(() => {
 *   // This will only run after user stops typing for 300ms
 *   performSearch(debouncedSearch);
 * }, [debouncedSearch]);
 * ```
 */
export function useDebounce<T>(
  value: T,
  delay: number = DEFAULT_DEBOUNCE_DELAY
): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounced callback hook - returns a memoized callback that will only execute
 * after the specified delay has elapsed since the last invocation
 * 
 * @example
 * ```tsx
 * const debouncedSave = useDebouncedCallback((data) => {
 *   saveToAPI(data);
 * }, 500);
 * 
 * return <input onChange={(e) => debouncedSave(e.target.value)} />;
 * ```
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = DEFAULT_DEBOUNCE_DELAY
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Throttle hook - ensures function is called at most once per specified interval
 * 
 * @example
 * ```tsx
 * const throttledScroll = useThrottle(scrollPosition, 100);
 * 
 * useEffect(() => {
 *   updateNavbar(throttledScroll);
 * }, [throttledScroll]);
 * ```
 */
export function useThrottle<T>(
  value: T,
  interval: number = DEFAULT_THROTTLE_INTERVAL
): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastExecuted = useRef<number>(Date.now());

  useEffect(() => {
    if (Date.now() >= lastExecuted.current + interval) {
      lastExecuted.current = Date.now();
      setThrottledValue(value);
    } else {
      const timerId = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledValue(value);
      }, interval);

      return () => clearTimeout(timerId);
    }
  }, [value, interval]);

  return throttledValue;
}
