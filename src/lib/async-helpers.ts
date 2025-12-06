/**
 * @fileoverview Async Handler Utilities
 * @module src/lib/async-helpers
 * @description Wrapper functions for async operations with error handling
 *
 * @created 2025-12-06
 * @pattern Helper Utility
 */

import { logError } from "./firebase-error-logger";

/**
 * Result type for async operations
 */
export type AsyncResult<T> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: Error };

/**
 * Wrap async function with try-catch and return result object
 * @example
 * const result = await asyncHandler(() => fetchData());
 * if (result.success) console.log(result.data);
 * else console.error(result.error);
 */
export async function asyncHandler<T>(
  fn: () => Promise<T>,
  context?: string
): Promise<AsyncResult<T>> {
  try {
    const data = await fn();
    return { success: true, data, error: null };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    if (context) {
      logError(err, { context });
    }
    return { success: false, data: null, error: err };
  }
}

/**
 * Execute async function with automatic error logging and toast
 * @example
 * await withErrorHandling(
 *   () => updateProduct(id, data),
 *   { context: "ProductUpdate", onError: (e) => toast.error(e.message) }
 * );
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  options: {
    context?: string;
    onError?: (error: Error) => void;
    onSuccess?: (data: T) => void;
    fallback?: T;
  } = {}
): Promise<T | undefined> {
  try {
    const data = await fn();
    if (options.onSuccess) options.onSuccess(data);
    return data;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));

    if (options.context) {
      logError(err, { context: options.context });
    }

    if (options.onError) {
      options.onError(err);
    }

    return options.fallback;
  }
}

/**
 * Retry async function with exponential backoff
 * @example
 * const data = await retryAsync(
 *   () => fetchData(),
 *   { maxRetries: 3, delay: 1000 }
 * );
 */
export async function retryAsync<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    backoff?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const { maxRetries = 3, delay = 1000, backoff = 2, onRetry } = options;

  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries) {
        if (onRetry) onRetry(attempt + 1, lastError);

        const waitTime = delay * Math.pow(backoff, attempt);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError!;
}

/**
 * Execute async function with timeout
 * @example
 * const data = await withTimeout(
 *   () => fetchData(),
 *   5000, // 5 seconds
 *   "Request timed out"
 * );
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  timeoutError: string = "Operation timed out"
): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutError)), timeoutMs)
    ),
  ]);
}

/**
 * Debounce async function (only execute after delay with no new calls)
 * @example
 * const debouncedSearch = debounceAsync(searchProducts, 300);
 * debouncedSearch(query); // Will only execute after 300ms of no new calls
 */
export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: NodeJS.Timeout;
  let latestResolve: (value: any) => void;
  let latestReject: (error: any) => void;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve, reject) => {
      latestResolve = resolve;
      latestReject = reject;

      clearTimeout(timeoutId);

      timeoutId = setTimeout(async () => {
        try {
          const result = await fn(...args);
          latestResolve(result);
        } catch (error) {
          latestReject(error);
        }
      }, delayMs);
    });
  };
}

/**
 * Throttle async function (execute at most once per interval)
 * @example
 * const throttledSave = throttleAsync(saveData, 1000);
 * throttledSave(data); // Will only execute once per second
 */
export function throttleAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  intervalMs: number
): (...args: Parameters<T>) => Promise<ReturnType<T> | void> {
  let lastExecute = 0;
  let pending: Promise<ReturnType<T>> | null = null;

  return async (...args: Parameters<T>): Promise<ReturnType<T> | void> => {
    const now = Date.now();

    if (now - lastExecute >= intervalMs) {
      lastExecute = now;
      return fn(...args);
    }

    // Return existing pending promise if available
    if (pending) return pending;

    // Create new pending promise
    pending = new Promise<ReturnType<T>>((resolve) => {
      const waitTime = intervalMs - (now - lastExecute);
      setTimeout(async () => {
        lastExecute = Date.now();
        const result = await fn(...args);
        pending = null;
        resolve(result);
      }, waitTime);
    });

    return pending;
  };
}

/**
 * Execute multiple async functions in parallel with limit
 * @example
 * const results = await parallelLimit(
 *   [() => fetch(url1), () => fetch(url2), () => fetch(url3)],
 *   2 // Max 2 concurrent requests
 * );
 */
export async function parallelLimit<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<T[]> {
  const results: T[] = [];
  const executing: Promise<void>[] = [];

  for (const [index, task] of tasks.entries()) {
    const promise = task().then((result) => {
      results[index] = result;
    });

    executing.push(promise);

    if (executing.length >= limit) {
      await Promise.race(executing);
      executing.splice(
        executing.findIndex((p) => p === promise),
        1
      );
    }
  }

  await Promise.all(executing);
  return results;
}

/**
 * Execute async function and cache result
 * @example
 * const getCachedUser = memoizeAsync(fetchUser, 60000); // Cache for 1 minute
 * const user = await getCachedUser(userId);
 */
export function memoizeAsync<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  ttl: number = 60000
): T {
  const cache = new Map<string, { value: any; expiry: number }>();

  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);

    if (cached && Date.now() < cached.expiry) {
      return cached.value;
    }

    const value = await fn(...args);
    cache.set(key, { value, expiry: Date.now() + ttl });

    return value;
  }) as T;
}
