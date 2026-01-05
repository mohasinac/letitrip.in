import { DEBOUNCE_DELAYS, THROTTLE_INTERVALS } from "@/constants/ui-constants";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Debounce hook - delays execution until after wait milliseconds have elapsed
 * since the last time the debounced function was invoked
 */
export function useDebounce<T>(
  value: T,
  delay: number = DEBOUNCE_DELAYS.DEFAULT
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
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = DEBOUNCE_DELAYS.DEFAULT
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
 */
export function useThrottle<T>(
  value: T,
  interval: number = THROTTLE_INTERVALS.DEFAULT
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

/**
 * API call hook with automatic retry and debouncing
 */
interface UseApiOptions {
  debounce?: number;
  retry?: number;
  retryDelay?: number;
  enabled?: boolean;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[],
  options: UseApiOptions = {}
) {
  const {
    debounce = DEBOUNCE_DELAYS.DEFAULT,
    retry = 0,
    retryDelay = 1000,
    enabled = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController>();

  const execute = useCallback(async () => {
    if (!enabled) return;

    // Abort previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    let attempts = 0;
    const maxAttempts = retry + 1;

    while (attempts < maxAttempts) {
      try {
        const result = await apiCall();

        if (mountedRef.current) {
          setData(result);
          setLoading(false);
        }
        return;
      } catch (err) {
        attempts++;

        if (attempts >= maxAttempts) {
          if (mountedRef.current) {
            setError(err instanceof Error ? err : new Error("API call failed"));
            setLoading(false);
          }
          return;
        }

        // Wait before retry
        await new Promise((resolve) =>
          setTimeout(resolve, retryDelay * attempts)
        );
      }
    }
  }, [apiCall, enabled, retry, retryDelay]);

  const debouncedExecute = useDebouncedCallback(execute, debounce);

  useEffect(() => {
    mountedRef.current = true; // Reset mounted state when effect runs

    if (debounce > 0) {
      debouncedExecute();
    } else {
      execute();
    }

    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  const refetch = useCallback(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch };
}
