"use client";

/**
 * Data Fetching Adapters
 *
 * Framework-agnostic adapters for different data fetching libraries.
 * Allows components to work with TanStack Query, SWR, Apollo, or custom solutions.
 *
 * @example
 * ```tsx
 * // With TanStack Query
 * import { useQuery } from '@tanstack/react-query';
 * import { createTanStackAdapter } from './data-fetching-adapters';
 *
 * const adapter = createTanStackAdapter(useQuery);
 *
 * // With SWR
 * import useSWR from 'swr';
 * import { createSWRAdapter } from './data-fetching-adapters';
 *
 * const adapter = createSWRAdapter(useSWR);
 *
 * // Use adapter in components
 * function MyComponent({ adapter }) {
 *   const { data, isLoading } = adapter.useQuery({
 *     key: ['products'],
 *     fetcher: fetchProducts
 *   });
 * }
 * ```
 */

/**
 * Generic data fetching adapter interface
 */
export interface DataFetchingAdapter {
  /**
   * Query hook for fetching data
   */
  useQuery: <TData = unknown>(options: {
    key: readonly unknown[];
    fetcher: () => Promise<TData>;
    enabled?: boolean;
    staleTime?: number;
    cacheTime?: number;
  }) => {
    data: TData | undefined;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
  };

  /**
   * Mutation hook for modifying data
   */
  useMutation: <TData = unknown, TVariables = void>(options: {
    mutationFn: (variables: TVariables) => Promise<TData>;
    onSuccess?: (data: TData) => void;
    onError?: (error: Error) => void;
  }) => {
    mutate: (variables: TVariables) => void;
    mutateAsync: (variables: TVariables) => Promise<TData>;
    isLoading: boolean;
    isError: boolean;
    error: Error | null;
    data: TData | undefined;
  };

  /**
   * Invalidate queries to trigger refetch
   */
  invalidateQueries?: (key: readonly unknown[]) => Promise<void>;

  /**
   * Prefetch data
   */
  prefetchQuery?: <TData = unknown>(options: {
    key: readonly unknown[];
    fetcher: () => Promise<TData>;
  }) => Promise<void>;
}

/**
 * Create adapter for TanStack Query (React Query)
 *
 * @example
 * ```tsx
 * import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 * import { createTanStackAdapter } from './adapters';
 *
 * const adapter = createTanStackAdapter({ useQuery, useMutation, useQueryClient });
 *
 * // Use in component
 * const { data, isLoading } = adapter.useQuery({
 *   key: ['products'],
 *   fetcher: () => api.getProducts()
 * });
 * ```
 */
export function createTanStackAdapter(hooks: {
  useQuery: any;
  useMutation: any;
  useQueryClient?: () => any;
}): DataFetchingAdapter {
  return {
    useQuery: <TData = unknown>(options: {
      key: readonly unknown[];
      fetcher: () => Promise<TData>;
      enabled?: boolean;
      staleTime?: number;
      cacheTime?: number;
    }) => {
      const result = hooks.useQuery({
        queryKey: options.key,
        queryFn: options.fetcher,
        enabled: options.enabled,
        staleTime: options.staleTime,
        cacheTime: options.cacheTime,
      });

      return {
        data: result.data,
        isLoading: result.isLoading,
        isError: result.isError,
        error: result.error,
        refetch: async () => {
          await result.refetch();
        },
      };
    },

    useMutation: <TData = unknown, TVariables = void>(options: {
      mutationFn: (variables: TVariables) => Promise<TData>;
      onSuccess?: (data: TData) => void;
      onError?: (error: Error) => void;
    }) => {
      const result = hooks.useMutation({
        mutationFn: options.mutationFn,
        onSuccess: options.onSuccess,
        onError: options.onError,
      });

      return {
        mutate: result.mutate,
        mutateAsync: result.mutateAsync,
        isLoading: result.isLoading || result.isPending,
        isError: result.isError,
        error: result.error,
        data: result.data,
      };
    },

    invalidateQueries: hooks.useQueryClient
      ? async (key: readonly unknown[]) => {
          const queryClient = hooks.useQueryClient!();
          await queryClient.invalidateQueries({ queryKey: key });
        }
      : undefined,

    prefetchQuery: hooks.useQueryClient
      ? async <TData = unknown>(options: {
          key: readonly unknown[];
          fetcher: () => Promise<TData>;
        }) => {
          const queryClient = hooks.useQueryClient!();
          await queryClient.prefetchQuery({
            queryKey: options.key,
            queryFn: options.fetcher,
          });
        }
      : undefined,
  };
}

/**
 * Create adapter for SWR
 *
 * @example
 * ```tsx
 * import useSWR, { useSWRConfig } from 'swr';
 * import { createSWRAdapter } from './adapters';
 *
 * const adapter = createSWRAdapter({ useSWR, useSWRConfig });
 *
 * // Use in component
 * const { data, isLoading } = adapter.useQuery({
 *   key: ['products'],
 *   fetcher: () => api.getProducts()
 * });
 * ```
 */
export function createSWRAdapter(hooks: {
  useSWR: <T>(
    key: string | null,
    fetcher: () => Promise<T>,
    config?: any
  ) => any;
  useSWRConfig?: () => any;
}): DataFetchingAdapter {
  return {
    useQuery: <TData = unknown>(options: {
      key: readonly unknown[];
      fetcher: () => Promise<TData>;
      enabled?: boolean;
      staleTime?: number;
    }) => {
      const keyString = JSON.stringify(options.key);
      const shouldFetch = options.enabled !== false;

      const result = hooks.useSWR<TData>(
        shouldFetch ? keyString : null,
        options.fetcher,
        {
          dedupingInterval: options.staleTime,
        }
      );

      return {
        data: result.data,
        isLoading: result.isLoading || result.isValidating,
        isError: !!result.error,
        error: result.error || null,
        refetch: async () => {
          await result.mutate();
        },
      };
    },

    useMutation: <TData = unknown, TVariables = void>(options: {
      mutationFn: (variables: TVariables) => Promise<TData>;
      onSuccess?: (data: TData) => void;
      onError?: (error: Error) => void;
    }) => {
      // SWR doesn't have built-in mutation hook, implement custom logic
      const [state, setState] = useState<{
        data: TData | undefined;
        isLoading: boolean;
        isError: boolean;
        error: Error | null;
      }>({
        data: undefined,
        isLoading: false,
        isError: false,
        error: null,
      });

      const mutate = useCallback(
        (variables: TVariables) => {
          mutateAsync(variables).catch(() => {
            // Error handled in mutateAsync
          });
        },
        [options.mutationFn]
      );

      const mutateAsync = useCallback(
        async (variables: TVariables): Promise<TData> => {
          setState((prev) => ({
            ...prev,
            isLoading: true,
            isError: false,
            error: null,
          }));

          try {
            const data = await options.mutationFn(variables);
            setState({ data, isLoading: false, isError: false, error: null });
            options.onSuccess?.(data);
            return data;
          } catch (error) {
            const err = error as Error;
            setState((prev) => ({
              ...prev,
              isLoading: false,
              isError: true,
              error: err,
            }));
            options.onError?.(err);
            throw err;
          }
        },
        [options.mutationFn, options.onSuccess, options.onError]
      );

      return {
        mutate,
        mutateAsync,
        isLoading: state.isLoading,
        isError: state.isError,
        error: state.error,
        data: state.data,
      };
    },

    invalidateQueries: hooks.useSWRConfig
      ? async (key: readonly unknown[]) => {
          const { mutate } = hooks.useSWRConfig!();
          const keyString = JSON.stringify(key);
          await mutate(keyString);
        }
      : undefined,

    prefetchQuery: undefined, // SWR doesn't have built-in prefetch
  };
}

/**
 * Create adapter for custom fetch implementation
 *
 * @example
 * ```tsx
 * import { useQuery, useMutation } from './custom-hooks';
 * import { createCustomAdapter } from './adapters';
 *
 * const adapter = createCustomAdapter({ useQuery, useMutation });
 * ```
 */
export function createCustomAdapter(hooks: {
  useQuery: any;
  useMutation: any;
}): DataFetchingAdapter {
  return {
    useQuery: <TData = unknown>(options: {
      key: readonly unknown[];
      fetcher: () => Promise<TData>;
      enabled?: boolean;
      staleTime?: number;
      cacheTime?: number;
    }) => {
      const result = hooks.useQuery({
        queryKey: options.key,
        queryFn: options.fetcher,
        enabled: options.enabled,
        staleTime: options.staleTime,
        cacheTime: options.cacheTime,
      });

      return {
        data: result.data,
        isLoading: result.isLoading,
        isError: result.isError,
        error: result.error,
        refetch: result.refetch,
      };
    },

    useMutation: <TData = unknown, TVariables = void>(options: {
      mutationFn: (variables: TVariables) => Promise<TData>;
      onSuccess?: (data: TData) => void;
      onError?: (error: Error) => void;
    }) => {
      const result = hooks.useMutation(options);

      return {
        mutate: result.mutate,
        mutateAsync: result.mutateAsync,
        isLoading: result.isLoading,
        isError: result.isError,
        error: result.error,
        data: result.data,
      };
    },
  };
}

// Helper imports for SWR adapter
import { useCallback, useState } from "react";

export default {
  createTanStackAdapter,
  createSWRAdapter,
  createCustomAdapter,
};
