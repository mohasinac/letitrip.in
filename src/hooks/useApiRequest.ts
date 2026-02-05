/**
 * API Request Hook
 * 
 * @deprecated Use useApiQuery or useApiMutation from '@/hooks/useApiQuery' and '@/hooks/useApiMutation' instead.
 * This hook is kept for backward compatibility but will be removed in a future version.
 * 
 * Migration examples:
 * ```tsx
 * // OLD: useApiRequest
 * const { execute, data, loading } = useApiRequest();
 * execute({ url: '/api/user', method: 'GET' });
 * 
 * // NEW: useApiQuery
 * const { data, isLoading } = useApiQuery({
 *   queryKey: ['user'],
 *   queryFn: () => apiClient.get(API_ENDPOINTS.USER.PROFILE)
 * });
 * 
 * // OLD: useApiRequest for POST
 * execute({ url: '/api/user', method: 'POST', body: data });
 * 
 * // NEW: useApiMutation
 * const { mutate, isLoading } = useApiMutation({
 *   mutationFn: (data) => apiClient.post(API_ENDPOINTS.USER.PROFILE, data)
 * });
 * mutate(data);
 * ```
 */

import { useState, useCallback } from 'react';

interface ApiRequestOptions<T> {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

interface ApiRequestState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export function useApiRequest<T = any>() {
  const [state, setState] = useState<ApiRequestState<T>>({
    data: null,
    loading: false,
    error: null,
    success: false,
  });

  const execute = useCallback(
    async (options: ApiRequestOptions<T>) => {
      setState({
        data: null,
        loading: true,
        error: null,
        success: false,
      });

      try {
        const response = await fetch(options.url, {
          method: options.method || 'GET',
          headers: options.body
            ? { 'Content-Type': 'application/json' }
            : undefined,
          body: options.body ? JSON.stringify(options.body) : undefined,
        });

        const result = await response.json();

        if (result.success) {
          setState({
            data: result.data || result,
            loading: false,
            error: null,
            success: true,
          });
          options.onSuccess?.(result.data || result);
        } else {
          const errorMessage = result.error || 'Request failed';
          setState({
            data: null,
            loading: false,
            error: errorMessage,
            success: false,
          });
          options.onError?.(errorMessage);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'An unexpected error occurred';
        setState({
          data: null,
          loading: false,
          error: errorMessage,
          success: false,
        });
        options.onError?.(errorMessage);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
