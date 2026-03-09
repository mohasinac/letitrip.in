"use client";

/**
 * useApiMutation Hook — TanStack Query adapter
 *
 * Thin wrapper around @tanstack/react-query's `useMutation` that preserves the
 * existing interface so that every caller continues to work without changes:
 * - `mutate(variables)` returns Promise<TData> (uses mutateAsync internally)
 * - `isLoading` (mapped from TanStack v5's `isPending`)
 * - `onSuccess` / `onError` / `onSettled` callbacks preserved
 *
 * Usage:
 * ```tsx
 * const { mutate, isLoading, error } = useApiMutation({
 *   mutationFn: (data) => userService.updateProfile(data),
 *   onSuccess: () => toast.success('Saved!'),
 * });
 * await mutate(formData);
 * ```
 */

import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { ApiClientError } from "@/lib/api-client";

interface UseApiMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
  onError?: (
    error: ApiClientError,
    variables: TVariables,
  ) => void | Promise<void>;
  onSettled?: (
    data: TData | undefined,
    error: ApiClientError | null,
    variables: TVariables,
  ) => void | Promise<void>;
}

interface UseApiMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
  error: ApiClientError | null;
  data: TData | undefined;
  reset: () => void;
}

export function useApiMutation<TData = any, TVariables = any>(
  options: UseApiMutationOptions<TData, TVariables>,
): UseApiMutationResult<TData, TVariables> {
  const { mutationFn, onSuccess, onError, onSettled } = options;

  // Keep callbacks in refs so TanStack's stable handlers always call the latest version
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const onSettledRef = useRef(onSettled);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);
  useEffect(() => {
    onSettledRef.current = onSettled;
  }, [onSettled]);

  const mutation = useMutation<TData, Error, TVariables>({
    mutationFn,
    onSuccess: async (data, variables) => {
      await onSuccessRef.current?.(data, variables);
    },
    onError: async (error, variables) => {
      const apiError =
        error instanceof ApiClientError
          ? error
          : new ApiClientError(error.message, 500);
      await onErrorRef.current?.(apiError, variables);
    },
    onSettled: async (data, error, variables) => {
      const apiError = error
        ? error instanceof ApiClientError
          ? error
          : new ApiClientError(error.message, 500)
        : null;
      await onSettledRef.current?.(data, apiError, variables);
    },
  });

  // Expose mutate as Promise-returning for backward compatibility.
  // TanStack v5's mutate() returns void; mutateAsync() returns Promise.
  const mutate = async (variables: TVariables): Promise<TData> => {
    return mutation.mutateAsync(variables);
  };

  const apiError: ApiClientError | null = mutation.error
    ? mutation.error instanceof ApiClientError
      ? mutation.error
      : new ApiClientError(mutation.error.message, 500)
    : null;

  return {
    mutate,
    isLoading: mutation.isPending, // TanStack v5: isPending replaces isLoading
    error: apiError,
    data: mutation.data,
    reset: mutation.reset,
  };
}
