/**
 * useApiQuery Hook
 * React hook for fetching data with automatic loading, error states, and refetching
 * 
 * Usage:
 * ```tsx
 * const { data, isLoading, error, refetch } = useApiQuery({
 *   queryKey: ['profile'],
 *   queryFn: () => apiClient.get(API_ENDPOINTS.USER.PROFILE),
 *   enabled: true,
 * });
 * 
 * if (isLoading) return <Spinner />;
 * if (error) return <Alert>{error.message}</Alert>;
 * return <div>{data.name}</div>;
 * ```
 */

import { useState, useEffect, useCallback } from 'react';
import { ApiClientError } from '@/lib/api-client';

interface UseApiQueryOptions<TData> {
  queryKey: string[];
  queryFn: () => Promise<TData>;
  enabled?: boolean;
  refetchInterval?: number;
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
  options: UseApiQueryOptions<TData>
): UseApiQueryResult<TData> {
  const { queryKey, queryFn, enabled = true, refetchInterval, onSuccess, onError } = options;
  
  const [data, setData] = useState<TData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<ApiClientError | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setIsFetching(true);
    if (!data) {
      setIsLoading(true);
    }

    try {
      const result = await queryFn();
      setData(result);
      setError(null);
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      const apiError = err instanceof ApiClientError
        ? err
        : new ApiClientError(
            err instanceof Error ? err.message : 'An error occurred',
            500
          );
      
      setError(apiError);
      
      if (onError) {
        onError(apiError);
      }
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [enabled, queryFn, onSuccess, onError, data]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [queryKey.join(','), enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refetch interval
  useEffect(() => {
    if (!refetchInterval || !enabled) return;

    const interval = setInterval(fetchData, refetchInterval);
    return () => clearInterval(interval);
  }, [refetchInterval, enabled, fetchData]);

  return {
    data,
    isLoading,
    isFetching,
    error,
    refetch: fetchData,
  };
}
