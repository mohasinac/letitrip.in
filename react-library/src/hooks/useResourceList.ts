
/**
 * useResourceList Hook
 * Task 1.8.1 - Common Hooks & Utilities
 *
 * Unified resource list hook with Sieve-style pagination, filtering, sorting, and search.
 * Provides a consistent interface for loading and managing paginated lists of any resource type.
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, pagination, filters, reload } = useResourceList<Product>({
 *   endpoint: '/api/products',
 *   initialPageSize: 20,
 *   initialFilters: { status: 'published' },
 *   initialSort: { field: 'createdAt', direction: 'desc' }
 * });
 *
 * // Use the data
 * if (isLoading) return <Spinner />;
 * if (error) return <ErrorMessage error={error} />;
 * return <ProductList products={data} />;
 * ```
 */

import { useCallback, useEffect, useState } from "react";
import { useLoadingState, UseLoadingStateReturn } from "./useLoadingState";

// ==================== TYPES ====================

/**
 * Sieve pagination parameters
 */
export interface SievePagination {
  /** Current page number (1-based) */
  page: number;
  /** Items per page */
  pageSize: number;
  /** Total number of items */
  totalCount: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there is a next page */
  hasNextPage: boolean;
  /** Whether there is a previous page */
  hasPreviousPage: boolean;
}

/**
 * Sort configuration
 */
export interface SortField {
  /** Field name to sort by */
  field: string;
  /** Sort direction */
  direction: "asc" | "desc";
}

/**
 * Filter value types
 */
export type FilterValue = string | number | boolean | null;

/**
 * Filter configuration
 */
export interface FilterConfig {
  [key: string]: FilterValue;
}

/**
 * API response structure
 */
export interface ApiListResponse<T> {
  /** Array of items */
  data: T[];
  /** Pagination metadata */
  pagination: SievePagination;
}

/**
 * useResourceList options
 */
export interface UseResourceListOptions<T> {
  /** API endpoint to fetch data from */
  endpoint: string;
  /** Initial page number (default: 1) */
  initialPage?: number;
  /** Initial page size (default: 20) */
  initialPageSize?: number;
  /** Initial filters */
  initialFilters?: FilterConfig;
  /** Initial sort configuration */
  initialSort?: SortField;
  /** Initial search query */
  initialSearch?: string;
  /** Auto-fetch on mount (default: true) */
  autoFetch?: boolean;
  /** Additional query parameters */
  additionalParams?: Record<string, string>;
  /** Transform response data */
  transformData?: (data: T[]) => T[];
  /** Called when data is loaded */
  onLoadSuccess?: (data: T[], pagination: SievePagination) => void;
  /** Called when loading fails */
  onLoadError?: (error: Error) => void;
}

/**
 * useResourceList return value
 */
export interface UseResourceListReturn<T>
  extends Omit<UseLoadingStateReturn<T[]>, "execute" | "retry"> {
  /** Array of items */
  data: T[] | null;
  /** Current pagination state */
  pagination: SievePagination;
  /** Current filters */
  filters: FilterConfig;
  /** Current sort configuration */
  sort: SortField | null;
  /** Current search query */
  search: string;
  /** Set current page */
  setPage: (page: number) => void;
  /** Set page size */
  setPageSize: (pageSize: number) => void;
  /** Go to next page */
  nextPage: () => void;
  /** Go to previous page */
  prevPage: () => void;
  /** Set filters */
  setFilters: (filters: FilterConfig) => void;
  /** Update a single filter */
  updateFilter: (key: string, value: FilterValue) => void;
  /** Clear all filters */
  clearFilters: () => void;
  /** Set sort configuration */
  setSort: (sort: SortField | null) => void;
  /** Set search query */
  setSearch: (search: string) => void;
  /** Reload data with current parameters */
  reload: () => Promise<void>;
  /** Reset to initial state */
  reset: () => void;
}

// ==================== HOOK ====================

/**
 * Hook for managing resource lists with Sieve pagination
 *
 * @example
 * ```tsx
 * // Basic usage
 * const { data, isLoading, pagination, setPage } = useResourceList<Product>({
 *   endpoint: '/api/products',
 * });
 *
 * // With filters and search
 * const { data, filters, setFilters, search, setSearch } = useResourceList<Order>({
 *   endpoint: '/api/orders',
 *   initialFilters: { status: 'pending' },
 *   initialSearch: 'customer name',
 * });
 *
 * // With custom sort
 * const { data, sort, setSort } = useResourceList<Shop>({
 *   endpoint: '/api/shops',
 *   initialSort: { field: 'rating', direction: 'desc' },
 * });
 * ```
 */
export function useResourceList<T = any>(
  options: UseResourceListOptions<T>
): UseResourceListReturn<T> {
  const {
    endpoint,
    initialPage = 1,
    initialPageSize = 20,
    initialFilters = {},
    initialSort = null,
    initialSearch = "",
    autoFetch = true,
    additionalParams = {},
    transformData,
    onLoadSuccess,
    onLoadError,
  } = options;

  // State
  const [pagination, setPagination] = useState<SievePagination>({
    page: initialPage,
    pageSize: initialPageSize,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [filters, setFiltersState] = useState<FilterConfig>(initialFilters);
  const [sort, setSortState] = useState<SortField | null>(initialSort);
  const [search, setSearchState] = useState<string>(initialSearch);

  // Loading state
  const loadingState = useLoadingState<T[]>({
    initialData: [],
    onLoadSuccess: (data) => {
      if (onLoadSuccess && pagination) {
        onLoadSuccess(data, pagination);
      }
    },
    onLoadError,
  });

  const { isLoading, error, data, setData, setError } = loadingState;

  /**
   * Build URL with query parameters
   */
  const buildUrl = useCallback(
    (
      page: number,
      pageSize: number,
      currentFilters: FilterConfig,
      currentSort: SortField | null,
      currentSearch: string
    ): string => {
      const params = new URLSearchParams();

      // Pagination
      params.set("page", page.toString());
      params.set("pageSize", pageSize.toString());

      // Filters (Sieve format: filters=key==value,key2>value2)
      if (Object.keys(currentFilters).length > 0) {
        const filterStr = Object.entries(currentFilters)
          .filter(([, value]) => value !== null && value !== undefined)
          .map(([key, value]) => `${key}==${value}`)
          .join(",");
        if (filterStr) {
          params.set("filters", filterStr);
        }
      }

      // Sort (Sieve format: sorts=field or sorts=-field for desc)
      if (currentSort) {
        const sortStr =
          currentSort.direction === "desc"
            ? `-${currentSort.field}`
            : currentSort.field;
        params.set("sorts", sortStr);
      }

      // Search
      if (currentSearch) {
        params.set("search", currentSearch);
      }

      // Additional params
      Object.entries(additionalParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          params.set(key, value);
        }
      });

      return `${endpoint}?${params.toString()}`;
    },
    [endpoint, additionalParams]
  );

  /**
   * Fetch data from API
   */
  const fetchData = useCallback(
    async (
      page: number,
      pageSize: number,
      currentFilters: FilterConfig,
      currentSort: SortField | null,
      currentSearch: string
    ) => {
      try {
        const url = buildUrl(
          page,
          pageSize,
          currentFilters,
          currentSort,
          currentSearch
        );

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch data: ${response.status} ${response.statusText}`
          );
        }

        const result: ApiListResponse<T> = await response.json();

        // Transform data if transformer provided
        const transformedData = transformData
          ? transformData(result.data)
          : result.data;

        setData(transformedData);
        setPagination(result.pagination);
        setError(null);

        if (onLoadSuccess) {
          onLoadSuccess(transformedData, result.pagination);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setData([]);
        setPagination({
          page: 1,
          pageSize,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        });

        if (onLoadError) {
          onLoadError(error);
        }

        // Re-throw so execute() can handle it
        throw error;
      }
    },
    [buildUrl, setData, setError, transformData, onLoadSuccess, onLoadError]
  );

  /**
   * Load data wrapper with loading state
   */
  const loadData = useCallback(async () => {
    await loadingState.execute(
      () =>
        fetchData(pagination.page, pagination.pageSize, filters, sort, search),
      { setData: false } // Don't set data in execute, we handle it in fetchData
    );
  }, [
    loadingState,
    fetchData,
    pagination.page,
    pagination.pageSize,
    filters,
    sort,
    search,
  ]);

  // Auto-fetch on mount or when dependencies change
  useEffect(() => {
    if (autoFetch) {
      loadData();
    }
  }, [pagination.page, pagination.pageSize, filters, sort, search]); // eslint-disable-line react-hooks/exhaustive-deps

  // ==================== PAGINATION HANDLERS ====================

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setPagination((prev) => ({ ...prev, pageSize, page: 1 })); // Reset to page 1 when changing page size
  }, []);

  const nextPage = useCallback(() => {
    setPagination((prev) => {
      if (prev.hasNextPage) {
        return { ...prev, page: prev.page + 1 };
      }
      return prev;
    });
  }, []);

  const prevPage = useCallback(() => {
    setPagination((prev) => {
      if (prev.hasPreviousPage) {
        return { ...prev, page: prev.page - 1 };
      }
      return prev;
    });
  }, []);

  // ==================== FILTER HANDLERS ====================

  const setFilters = useCallback((newFilters: FilterConfig) => {
    setFiltersState(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1 when filters change
  }, []);

  const updateFilter = useCallback((key: string, value: FilterValue) => {
    setFiltersState((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1 when filters change
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({});
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1 when filters clear
  }, []);

  // ==================== SORT HANDLERS ====================

  const setSort = useCallback((newSort: SortField | null) => {
    setSortState(newSort);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1 when sort changes
  }, []);

  // ==================== SEARCH HANDLERS ====================

  const setSearch = useCallback((newSearch: string) => {
    setSearchState(newSearch);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1 when search changes
  }, []);

  // ==================== UTILITY HANDLERS ====================

  const reload = useCallback(async () => {
    await loadData();
  }, [loadData]);

  const reset = useCallback(() => {
    setPagination({
      page: initialPage,
      pageSize: initialPageSize,
      totalCount: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });
    setFiltersState(initialFilters);
    setSortState(initialSort);
    setSearchState(initialSearch);
    setData([]);
    setError(null);
  }, [
    initialPage,
    initialPageSize,
    initialFilters,
    initialSort,
    initialSearch,
    setData,
    setError,
  ]);

  // ==================== RETURN ====================

  return {
    // Data and loading state
    data,
    isLoading,
    error,
    isInitialized: loadingState.isInitialized,
    isRefreshing: loadingState.isRefreshing,

    // Pagination
    pagination,
    setPage,
    setPageSize,
    nextPage,
    prevPage,

    // Filters
    filters,
    setFilters,
    updateFilter,
    clearFilters,

    // Sort
    sort,
    setSort,

    // Search
    search,
    setSearch,

    // Utilities
    reload,
    reset,
    setData,
    setError,
    clearError: loadingState.clearError,
  };
}

export default useResourceList;
