/**
 * Generic Query Hook
 *
 * Framework-agnostic hook for data fetching with caching.
 * Can be used with any query library (React Query, SWR, Apollo, etc.) or custom implementation.
 *
 * This is a reference implementation. In production, use it with TanStack Query,
 * SWR, or your preferred data fetching library.
 *
 * @example
 * ```tsx
 * // With custom fetcher
 * const { data, isLoading, error, refetch } = useQuery({
 *   queryKey: ['products', filters],
 *   queryFn: () => api.getProducts(filters),
 *   staleTime: 5000,
 * });
 *
 * // With TanStack Query (recommended)
 * import { useQuery as useTanStackQuery } from '@tanstack/react-query';
 * const query = useTanStackQuery({
 *   queryKey: ['products'],
 *   queryFn: fetchProducts
 * });
 * ```
 */

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseQueryOptions<TData = unknown, TError = Error> {
  /**
   * Unique key for the query (used for caching)
   */
  queryKey: readonly unknown[];

  /**
   * Function that returns the data
   */
  queryFn: () => Promise<TData>;

  /**
   * Whether the query should run
   * @default true
   */
  enabled?: boolean;

  /**
   * Time in milliseconds after which data is considered stale
   * @default 0
   */
  staleTime?: number;

  /**
   * Time in milliseconds after which unused data is garbage collected
   * @default 5 * 60 * 1000 (5 minutes)
   */
  cacheTime?: number;

  /**
   * Number of retry attempts
   * @default 0
   */
  retry?: number;

  /**
   * Delay in milliseconds between retries
   * @default 1000
   */
  retryDelay?: number;

  /**
   * Callback when query succeeds
   */
  onSuccess?: (data: TData) => void;

  /**
   * Callback when query fails
   */
  onError?: (error: TError) => void;

  /**
   * Callback when query settles (success or error)
   */
  onSettled?: (data: TData | undefined, error: TError | null) => void;

  /**
   * Initial data
   */
  initialData?: TData;

  /**
   * Refetch interval in milliseconds (for polling)
   */
  refetchInterval?: number;

  /**
   * Whether to refetch on window focus
   * @default false
   */
  refetchOnWindowFocus?: boolean;

  /**
   * Whether to refetch on reconnect
   * @default false
   */
  refetchOnReconnect?: boolean;
}

export interface UseQueryResult<TData = unknown, TError = Error> {
  data: TData | undefined;
  error: TError | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  isFetching: boolean;
  refetch: () => Promise<void>;
  status: "idle" | "loading" | "error" | "success";
}

// Simple in-memory cache (for demo purposes)
// In production, use a proper caching library
const queryCache = new Map<string, { data: any; timestamp: number }>();

function getCacheKey(queryKey: readonly unknown[]): string {
  return JSON.stringify(queryKey);
}

/**
 * Generic query hook (reference implementation)
 *
 * **Note**: This is a basic implementation for demonstration.
 * For production use, we recommend using TanStack Query (@tanstack/react-query)
 * or SWR (swr) which provide more robust features like:
 * - Automatic retries
 * - Request deduplication
 * - Pagination support
 * - Optimistic updates
 * - SSR support
 * - DevTools
 */
export function useQuery<TData = unknown, TError = Error>(
  options: UseQueryOptions<TData, TError>
): UseQueryResult<TData, TError> {
  const {
    queryKey,
    queryFn,
    enabled = true,
    staleTime = 0,
    cacheTime = 5 * 60 * 1000,
    retry = 0,
    retryDelay = 1000,
    onSuccess,
    onError,
    onSettled,
    initialData,
    refetchInterval,
    refetchOnWindowFocus = false,
    refetchOnReconnect = false,
  } = options;

  const [data, setData] = useState<TData | undefined>(initialData);
  const [error, setError] = useState<TError | null>(null);
  const [isLoading, setIsLoading] = useState(!initialData && enabled);
  const [isFetching, setIsFetching] = useState(false);

  const retryCountRef = useRef(0);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const cacheKey = getCacheKey(queryKey);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    // Check cache
    const cached = queryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < staleTime) {
      setData(cached.data);
      setIsLoading(false);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsFetching(true);
    if (!data) {
      setIsLoading(true);
    }

    try {
      const result = await queryFn();

      if (!mountedRef.current) return;

      // Update cache
      queryCache.set(cacheKey, {
        data: result,
        timestamp: Date.now(),
      });

      setData(result);
      setError(null);
      setIsLoading(false);
      setIsFetching(false);
      retryCountRef.current = 0;

      onSuccess?.(result);
      onSettled?.(result, null);
    } catch (err) {
      if (!mountedRef.current) return;

      const error = err as TError;

      // Retry logic
      if (retryCountRef.current < retry) {
        retryCountRef.current++;
        setTimeout(() => {
          if (mountedRef.current) {
            fetchData();
          }
        }, retryDelay * retryCountRef.current);
        return;
      }

      setError(error);
      setIsLoading(false);
      setIsFetching(false);

      onError?.(error);
      onSettled?.(undefined, error);
    }
  }, [
    enabled,
    queryFn,
    cacheKey,
    staleTime,
    data,
    retry,
    retryDelay,
    onSuccess,
    onError,
    onSettled,
  ]);

  const refetch = useCallback(async () => {
    queryCache.delete(cacheKey);
    await fetchData();
  }, [cacheKey, fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch interval (polling)
  useEffect(() => {
    if (!refetchInterval || !enabled) return;

    const intervalId = setInterval(refetch, refetchInterval);
    return () => clearInterval(intervalId);
  }, [refetchInterval, enabled, refetch]);

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus || !enabled) return;

    const handleFocus = () => refetch();
    if (typeof globalThis.window !== "undefined") {
      globalThis.window.addEventListener("focus", handleFocus);
      return () => globalThis.window.removeEventListener("focus", handleFocus);
    }
  }, [refetchOnWindowFocus, enabled, refetch]);

  // Refetch on reconnect
  useEffect(() => {
    if (!refetchOnReconnect || !enabled) return;

    const handleOnline = () => refetch();
    if (typeof globalThis.window !== "undefined") {
      globalThis.window.addEventListener("online", handleOnline);
      return () =>
        globalThis.window.removeEventListener("online", handleOnline);
    }
  }, [refetchOnReconnect, enabled, refetch]);

  // Cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Garbage collection
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      queryCache.delete(cacheKey);
    }, cacheTime);

    return () => clearTimeout(timeoutId);
  }, [cacheKey, cacheTime]);

  const isError = !!error;
  const isSuccess = !!data && !error;
  const status = isLoading
    ? "loading"
    : isError
    ? "error"
    : isSuccess
    ? "success"
    : "idle";

  return {
    data,
    error,
    isLoading,
    isError,
    isSuccess,
    isFetching,
    refetch,
    status,
  };
}

export default useQuery;
