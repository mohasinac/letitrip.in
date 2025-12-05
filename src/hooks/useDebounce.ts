/**
 * @fileoverview TypeScript Module
 * @module src/hooks/useDebounce
 * @description This file contains functionality related to useDebounce
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import { useEffect, useState, useRef, useCallback } from "react";

/**
 * Debounce hook - delays execution until after wait milliseconds have elapsed
 * since the last time the debounced function was invoked
 */
/**
 * Custom React hook for debounce
 *
 * @param {T} value - The value
 * @param {number} [delay] - The delay
 *
 * @returns {number} The usedebounce result
 *
 * @example
 * useDebounce(value, 123);
 */

/**
 * Custom React hook for debounce
 *
 * @param {T} value - The value
 * @param {number} [delay] - The delay
 *
 * @returns {number} The usedebounce result
 *
 * @example
 * useDebounce(value, 123);
 */

export function useDebounce<T>(value: T, delay: number = 500): T {
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
/**
 * Custom React hook for debounced callback
 *
 * @param {any[]} ...args - The ...args
 *
 * @returns {number} The usedebouncedcallback result
 *
 * @example
 * useDebouncedCallback(...args);
 */

/**
 * Custom React hook for debounced callback
 *
 * @param {any[]} ...args - The ...args
 *
 * @returns {number} The usedebouncedcallback result
 *
 * @example
 * useDebouncedCallback(...args);
 */

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  /** Callback */
  callback: T,
  /** Delay */
  delay: number = 500,
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
    [callback, delay],
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
/**
 * Custom React hook for throttle
 *
 * @param {T} value - The value
 * @param {number} [interval] - The interval
 *
 * @returns {number} The usethrottle result
 *
 * @example
 * useThrottle(value, 123);
 */

/**
 * Custom React hook for throttle
 *
 * @param {T} value - The value
 * @param {number} [interval] - The interval
 *
 * @returns {number} The usethrottle result
 *
 * @example
 * useThrottle(value, 123);
 */

export function useThrottle<T>(value: T, interval: number = 500): T {
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
  /** Debounce */
  debounce?: number;
  /** Retry */
  retry?: number;
  /** Retry Delay */
  retryDelay?: number;
  /** Enabled */
  enabled?: boolean;
}

/**
 * Function: Use Api
 */
/**
 * Custom React hook for api
 *
 * @param {(} apiCall - The api call
 *
 * @returns {any} The useapi result
 *
 * @example
 * useApi(apiCall);
 */

/**
 * Custom React hook for api
 *
 * @param {(} /** Api Call */
  apiCall - The /**  api  call */
  api call
 *
 * @returns {any} The useapi result
 *
 * @example
 * useApi(/** Api Call */
  apiCall);
 */

export function useApi<T>(
  /** Api Call */
  apiCall: () => Promise<T>,
  /** Dependencies */
  dependencies: any[],
  /** Options */
  options: UseApiOptions = {},
) {
  const {
    debounce = 0,
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
          setTimeout(resolve, retryDelay * attempts),
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
