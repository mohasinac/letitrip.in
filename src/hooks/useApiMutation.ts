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

import { useState, useCallback } from 'react';
import { ApiClientError } from '@/lib/api-client';

interface UseApiMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData, variables: TVariables) => void | Promise<void>;
  onError?: (error: ApiClientError, variables: TVariables) => void | Promise<void>;
  onSettled?: (data: TData | undefined, error: ApiClientError | null, variables: TVariables) => void | Promise<void>;
}

interface UseApiMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
  error: ApiClientError | null;
  data: TData | undefined;
  reset: () => void;
}

export function useApiMutation<TData = any, TVariables = any>(
  options: UseApiMutationOptions<TData, TVariables>
): UseApiMutationResult<TData, TVariables> {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [data, setData] = useState<TData | undefined>(undefined);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(undefined);
  }, []);

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await options.mutationFn(variables);
        setData(result);
        
        if (options.onSuccess) {
          await options.onSuccess(result, variables);
        }
        
        if (options.onSettled) {
          await options.onSettled(result, null, variables);
        }
        
        return result;
      } catch (err) {
        const apiError = err instanceof ApiClientError
          ? err
          : new ApiClientError(
              err instanceof Error ? err.message : 'An error occurred',
              500
            );
        
        setError(apiError);
        
        if (options.onError) {
          await options.onError(apiError, variables);
        }
        
        if (options.onSettled) {
          await options.onSettled(undefined, apiError, variables);
        }
        
        throw apiError;
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  return {
    mutate,
    isLoading,
    error,
    data,
    reset,
  };
}
