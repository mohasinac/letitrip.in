"use client";

/**
 * useApiQuery Hook
 * React hook for fetching data with automatic loading, error states, refetching,
 * and client-side caching with stale-while-revalidate pattern.
 *
 * Features:
 * - In-memory client-side cache using CacheManager singleton
 * - Stale-while-revalidate: returns cached data immediately, refetches in background
 * - Request deduplication: concurrent calls with same key share one fetch
 * - Configurable cache TTL per query
 *
 * Usage:
 * ```tsx
 * const { data, isLoading, error, refetch } = useApiQuery({
 *   queryKey: ['profile'],
 *   queryFn: () => apiClient.get(API_ENDPOINTS.USER.PROFILE),
 *   enabled: true,
 *   cacheTTL: 60000, // Cache for 60 seconds (default: 5 minutes)
 * });
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <Alert>{error.message}</Alert>;
 * return <div>{data.name}</div>;
 * ```
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { ApiClientError } from "@/lib/api-client";
import { CacheManager } from "@/classes";

// Default cache TTL: 5 minutes
const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

// In-flight request deduplication map
const inflightRequests = new Map<string, Promise<unknown>>();

// Client-side cache instance (shared across all hook instances)
const queryCache = CacheManager.getInstance(200);

interface UseApiQueryOptions<TData> {
  queryKey: string[];
  queryFn: () => Promise<TData>;
  enabled?: boolean;
  refetchInterval?: number;
  /** Cache time-to-live in milliseconds. Set to 0 to disable caching. Default: 5 minutes */
  cacheTTL?: number;
  onSuccess?: (data: TData) => void;
  onError?: (error: ApiClientError) => void;
}

interface UseApiQueryResult<TData> {
  data: TData | undefined;
  isLoading: boolean;
  isFetching: boolean;
  error: ApiClientError | null;
  refetch: () => Promise<void>;
}

export function useApiQuery<TData = any>(
  options: UseApiQueryOptions<TData>,
): UseApiQueryResult<TData> {
  const {
    queryKey,
    queryFn,
    enabled = true,
    refetchInterval,
    cacheTTL = DEFAULT_CACHE_TTL,
    onSuccess,
    onError,
  } = options;

  const cacheKey = queryKey.join(",");

  // Initialize state from cache if available (stale-while-revalidate)
  const cachedData = cacheTTL > 0 ? queryCache.get<TData>(cacheKey) : null;
  const [data, setData] = useState<TData | undefined>(cachedData ?? undefined);
  const [isLoading, setIsLoading] = useState(cachedData === null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<ApiClientError | null>(null);

  // Track mounted state to avoid setState on unmounted component
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Store unstable callback props in refs so fetchData identity stays stable
  const queryFnRef = useRef(queryFn);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    queryFnRef.current = queryFn;
  }, [queryFn]);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Track whether we have data via ref (avoids including `data` in deps)
  const hasDataRef = useRef(!!cachedData);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setIsFetching(true);
    if (!hasDataRef.current) {
      setIsLoading(true);
    }

    try {
      let result: TData;

      // Request deduplication: reuse in-flight request for same cache key
      if (inflightRequests.has(cacheKey)) {
        result = (await inflightRequests.get(cacheKey)) as TData;
      } else {
        const promise = queryFnRef.current();
        inflightRequests.set(cacheKey, promise);
        try {
          result = await promise;
        } finally {
          inflightRequests.delete(cacheKey);
        }
      }

      // Store in cache
      if (cacheTTL > 0) {
        queryCache.set(cacheKey, result, { ttl: cacheTTL });
      }

      if (!mountedRef.current) return;

      hasDataRef.current = true;
      setData(result);
      setError(null);

      if (onSuccessRef.current) {
        onSuccessRef.current(result);
      }
    } catch (err) {
      if (!mountedRef.current) return;

      const apiError =
        err instanceof ApiClientError
          ? err
          : new ApiClientError(
              err instanceof Error ? err.message : "An error occurred",
              500,
            );

      setError(apiError);

      if (onErrorRef.current) {
        onErrorRef.current(apiError);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        setIsFetching(false);
      }
    }
  }, [enabled, cacheKey, cacheTTL]);

  // Initial fetch (or background revalidation if we have cached data)
  useEffect(() => {
    fetchData();
  }, [cacheKey, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refetch interval — use ref so interval doesn't reset on fetchData identity change
  const fetchDataRef = useRef(fetchData);
  useEffect(() => {
    fetchDataRef.current = fetchData;
  }, [fetchData]);

  useEffect(() => {
    if (!refetchInterval || !enabled) return;

    const interval = setInterval(() => fetchDataRef.current(), refetchInterval);
    return () => clearInterval(interval);
  }, [refetchInterval, enabled]);

  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch: fetchData,
  };
}
