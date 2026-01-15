/**
 * useFetchResourceList Hook
 * Combines resource list state with async data fetching
 *
 * Purpose: Complete list fetching pattern with loading, pagination, and filtering
 * Replaces: Complex useEffect + useState + useCallback patterns in list pages
 *
 * @example
 * const list = useFetchResourceList({
 *   fetchFn: (page) => productsService.list({ page }),
 *   pageSize: 10,
 * });
 * list.refetch();
 */

import { useCallback, useEffect } from "react";
import { useLoadingState } from "./useLoadingState";
import {
  ResourceListConfig,
  useResourceListState,
  UseResourceListStateReturn,
} from "./useResourceListState";

export interface FetchResourceListConfig<T> extends ResourceListConfig {
  fetchFn: (options: {
    page: number;
    pageSize: number;
    filters: Record<string, any>;
    search: string;
  }) => Promise<{
    items: T[];
    total?: number;
    hasNextPage?: boolean;
    cursor?: string | null;
  }>;
  autoFetch?: boolean;
  onError?: (error: Error) => void;
}

export interface UseFetchResourceListReturn<T>
  extends UseResourceListStateReturn<T> {
  refetch: () => Promise<void>;
  isFetching: boolean;
  isFetchingMore: boolean;
}

export function useFetchResourceList<T extends { id: string }>({
  fetchFn,
  autoFetch = true,
  onError,
  ...listConfig
}: FetchResourceListConfig<T>): UseFetchResourceListReturn<T> {
  const list = useResourceListState<T>(listConfig);
  const { isLoading, execute } = useLoadingState({
    onLoadError: onError,
  });

  const fetchData = useCallback(async () => {
    list.setLoading(true);
    list.setError(null);

    try {
      await execute(async () => {
        const result = await fetchFn({
          page: list.pagination.currentPage,
          pageSize: list.pagination.pageSize,
          filters: list.filterValues,
          search: list.searchQuery,
        });

        list.setItems(result.items);

        if (result.hasNextPage !== undefined) {
          list.pagination.setHasNextPage(result.hasNextPage);
        }

        if (result.total !== undefined) {
          list.pagination.setTotalCount(result.total);
        }

        if (result.cursor !== undefined) {
          list.pagination.addCursor(result.cursor);
        }
      });
    } catch (err) {
      list.setError((err as Error).message);
    } finally {
      list.setLoading(false);
    }
  }, [list, execute, fetchFn]);

  const refetch = useCallback(async () => {
    list.pagination.reset();
    await fetchData();
  }, [list.pagination, fetchData]);

  // Auto fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, []);

  // Fetch when filters or search changes
  useEffect(() => {
    list.pagination.reset();
    if (list.filterValues || list.searchQuery) {
      fetchData();
    }
  }, [list.filterValues, list.searchQuery]);

  // Fetch when page changes
  useEffect(() => {
    fetchData();
  }, [list.pagination.currentPage]);

  return {
    ...list,
    refetch,
    isFetching: isLoading,
    isFetchingMore: isLoading && list.pagination.currentPage > 1,
  };
}

export default useFetchResourceList;
