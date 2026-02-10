"use client";

/**
 * useApiMutation Hook
 * React hook for handling API mutations with loading, error states, and optimistic updates
 *
 * Usage:
 * ```tsx
 * const { mutate, isLoading, error, data } = useApiMutation({
 *   mutationFn: (data) => apiClient.post(API_ENDPOINTS.USER.PROFILE, data),
 *   onSuccess: (data) => {
 *     toast.success('Profile updated!');
 *   },
 *   onError: (error) => {
 *     toast.error(error.message);
 *   }
 * });
 *
 * // Use in component
 * const handleSubmit = async (formData) => {
 *   await mutate(formData);
 * };
 * ```
 */

import { useState, useCallback, useRef, useEffect } from "react";
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [data, setData] = useState<TData | undefined>(undefined);

  // Store options in a ref so mutate callback stays stable
  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(undefined);
  }, []);

  const mutate = useCallback(async (variables: TVariables): Promise<TData> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await optionsRef.current.mutationFn(variables);
      setData(result);

      if (optionsRef.current.onSuccess) {
        await optionsRef.current.onSuccess(result, variables);
      }

      if (optionsRef.current.onSettled) {
        await optionsRef.current.onSettled(result, null, variables);
      }

      return result;
    } catch (err) {
      const apiError =
        err instanceof ApiClientError
          ? err
          : new ApiClientError(
              err instanceof Error ? err.message : "An error occurred",
              500,
            );

      setError(apiError);

      if (optionsRef.current.onError) {
        await optionsRef.current.onError(apiError, variables);
      }

      if (optionsRef.current.onSettled) {
        await optionsRef.current.onSettled(undefined, apiError, variables);
      }

      throw apiError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    mutate,
    isLoading,
    error,
    data,
    reset,
  };
}
