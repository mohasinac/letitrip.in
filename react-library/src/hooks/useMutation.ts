"use client";

/**
 * Generic Mutation Hook
 *
 * Framework-agnostic hook for data mutations with optimistic updates.
 * Can be used with any mutation library (React Query, SWR, Apollo, etc.) or custom implementation.
 *
 * @example
 * ```tsx
 * const updateProduct = useMutation({
 *   mutationFn: (product) => api.updateProduct(product),
 *   onSuccess: () => {
 *     toast.success('Product updated');
 *     // Invalidate and refetch related queries
 *   },
 *   onError: (error) => {
 *     toast.error(error.message);
 *   }
 * });
 *
 * // Usage
 * updateProduct.mutate({ id: '123', name: 'New Name' });
 * ```
 */

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseMutationOptions<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown
> {
  /**
   * Function that performs the mutation
   */
  mutationFn: (variables: TVariables) => Promise<TData>;

  /**
   * Callback before mutation starts (for optimistic updates)
   * Return value will be passed to onError and onSettled as context
   */
  onMutate?: (variables: TVariables) => Promise<TContext> | TContext | void;

  /**
   * Callback when mutation succeeds
   */
  onSuccess?: (
    data: TData,
    variables: TVariables,
    context: TContext | undefined
  ) => void;

  /**
   * Callback when mutation fails
   * Context is the value returned from onMutate
   */
  onError?: (
    error: TError,
    variables: TVariables,
    context: TContext | undefined
  ) => void;

  /**
   * Callback when mutation settles (success or error)
   */
  onSettled?: (
    data: TData | undefined,
    error: TError | null,
    variables: TVariables,
    context: TContext | undefined
  ) => void;

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
}

export interface UseMutationResult<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown
> {
  /**
   * Latest data returned from mutation
   */
  data: TData | undefined;

  /**
   * Latest error from mutation
   */
  error: TError | null;

  /**
   * Whether mutation is in progress
   */
  isLoading: boolean;

  /**
   * Whether mutation has failed
   */
  isError: boolean;

  /**
   * Whether mutation has succeeded
   */
  isSuccess: boolean;

  /**
   * Whether mutation is idle (not started)
   */
  isIdle: boolean;

  /**
   * Current status
   */
  status: "idle" | "loading" | "error" | "success";

  /**
   * Execute the mutation
   */
  mutate: (variables: TVariables) => void;

  /**
   * Execute the mutation (async)
   */
  mutateAsync: (variables: TVariables) => Promise<TData>;

  /**
   * Reset mutation state
   */
  reset: () => void;
}

/**
 * Generic mutation hook (reference implementation)
 *
 * **Note**: This is a basic implementation for demonstration.
 * For production use, we recommend using TanStack Query (@tanstack/react-query)
 * which provides more robust features like:
 * - Automatic retry with exponential backoff
 * - Optimistic updates with rollback
 * - Query invalidation
 * - Parallel mutations
 * - DevTools
 */
export function useMutation<
  TData = unknown,
  TError = Error,
  TVariables = void,
  TContext = unknown
>(
  options: UseMutationOptions<TData, TError, TVariables, TContext>
): UseMutationResult<TData, TError, TVariables, TContext> {
  const {
    mutationFn,
    onMutate,
    onSuccess,
    onError,
    onSettled,
    retry = 0,
    retryDelay = 1000,
  } = options;

  const [data, setData] = useState<TData | undefined>(undefined);
  const [error, setError] = useState<TError | null>(null);
  const [status, setStatus] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle");

  const mountedRef = useRef(true);
  const retryCountRef = useRef(0);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const reset = useCallback(() => {
    setData(undefined);
    setError(null);
    setStatus("idle");
    retryCountRef.current = 0;
  }, []);

  const executeMutation = useCallback(
    async (variables: TVariables, isRetry = false): Promise<TData> => {
      if (!isRetry) {
        setStatus("loading");
        setError(null);
      }

      let context: TContext | undefined;

      try {
        // Call onMutate for optimistic updates
        if (onMutate && !isRetry) {
          context = (await Promise.resolve(onMutate(variables))) as
            | TContext
            | undefined;
        }

        // Execute mutation
        const result = await mutationFn(variables);

        if (!mountedRef.current) return result;

        setData(result);
        setStatus("success");
        retryCountRef.current = 0;

        onSuccess?.(result, variables, context);
        onSettled?.(result, null, variables, context);

        return result;
      } catch (err) {
        if (!mountedRef.current) throw err;

        const error = err as TError;

        // Retry logic
        if (retryCountRef.current < retry) {
          retryCountRef.current++;

          return new Promise<TData>((resolve, reject) => {
            setTimeout(() => {
              if (mountedRef.current) {
                executeMutation(variables, true).then(resolve).catch(reject);
              } else {
                reject(error);
              }
            }, retryDelay * retryCountRef.current);
          });
        }

        setError(error);
        setStatus("error");

        onError?.(error, variables, context);
        onSettled?.(undefined, error, variables, context);

        throw error;
      }
    },
    [mutationFn, onMutate, onSuccess, onError, onSettled, retry, retryDelay]
  );

  const mutate = useCallback(
    (variables: TVariables) => {
      executeMutation(variables).catch(() => {
        // Error already handled in executeMutation
      });
    },
    [executeMutation]
  );

  const mutateAsync = useCallback(
    (variables: TVariables): Promise<TData> => {
      return executeMutation(variables);
    },
    [executeMutation]
  );

  const isIdle = status === "idle";
  const isLoading = status === "loading";
  const isError = status === "error";
  const isSuccess = status === "success";

  return {
    data,
    error,
    isLoading,
    isError,
    isSuccess,
    isIdle,
    status,
    mutate,
    mutateAsync,
    reset,
  };
}

export default useMutation;
