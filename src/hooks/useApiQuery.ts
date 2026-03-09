"use client";

/**
 * useApiQuery Hook — TanStack Query adapter
 *
 * Thin wrapper around @tanstack/react-query's `useQuery` that preserves the
 * existing interface (cacheTTL, onSuccess, onError, refetch as async void)
 * so that every caller continues to work without changes.
 *
 * TanStack Query v5 differences handled here:
 * - `onSuccess`/`onError` removed from useQuery options → emulated via useEffect
 * - `cacheTTL` → mapped to `staleTime`
 *
 * Usage:
 * ```tsx
 * const { data, isLoading, error, refetch } = useApiQuery({
 *   queryKey: ['profile'],
 *   queryFn: () => userService.getProfile(),
 *   cacheTTL: 60000,
 * });
 * ```
 */

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { ApiClientError } from "@/lib/api-client";
import { getQueryClient } from "@/components/providers/QueryProvider";

// Default cache TTL: 5 minutes (matches QueryProvider defaultOptions.staleTime)
const DEFAULT_CACHE_TTL = 5 * 60 * 1000;

/**
 * Invalidate one or more query keys and trigger a background refetch in every
 * mounted useApiQuery that matches.
 *
 * @example
 * invalidateQueries(["cart"]);            // single key
 * invalidateQueries(["cart"], ["user"]);  // multiple keys
 */
export function invalidateQueries(...queryKeys: string[][]) {
  const client = getQueryClient();
  for (const key of queryKeys) {
    client.invalidateQueries({ queryKey: key });
  }
}

interface UseApiQueryOptions<TData> {
  queryKey: string[];
  queryFn: () => Promise<TData>;
  enabled?: boolean;
  refetchInterval?: number;
  /** Cache time-to-live in milliseconds (mapped to staleTime). Default: 5 minutes */
  cacheTTL?: number;
  /** Pre-fetched data from the server (SSR). Prevents the initial client-side fetch. */
  initialData?: TData;
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
    initialData,
    onSuccess,
    onError,
  } = options;

  // Keep callbacks in refs so the effects below don't re-run on every render
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const result = useQuery<TData, Error>({
    queryKey,
    queryFn,
    enabled,
    refetchInterval,
    staleTime: cacheTTL,
    // When initialData is provided (from SSR), seed TanStack and treat it as
    // fresh for the full staleTime to avoid an immediate background refetch.
    initialData: initialData,
    initialDataUpdatedAt: initialData !== undefined ? Date.now() : undefined,
  });

  // TanStack v5 removed onSuccess/onError from useQuery options — emulate via useEffect.
  const prevDataRef = useRef<TData | undefined>(undefined);
  const prevErrorRef = useRef<Error | null>(null);

  useEffect(() => {
    if (result.data !== undefined && result.data !== prevDataRef.current) {
      prevDataRef.current = result.data;
      onSuccessRef.current?.(result.data);
    }
  }, [result.data]);

  useEffect(() => {
    if (result.error && result.error !== prevErrorRef.current) {
      prevErrorRef.current = result.error;
      const apiError =
        result.error instanceof ApiClientError
          ? result.error
          : new ApiClientError(result.error.message, 500);
      onErrorRef.current?.(apiError);
    }
  }, [result.error]);

  const apiError: ApiClientError | null = result.error
    ? result.error instanceof ApiClientError
      ? result.error
      : new ApiClientError(result.error.message, 500)
    : null;

  return {
    data: result.data,
    isLoading: result.isLoading,
    isFetching: result.isFetching,
    error: apiError,
    refetch: async () => {
      await result.refetch();
    },
  };
}
