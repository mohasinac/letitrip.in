/**
 * @fileoverview TypeScript Module
 * @module src/hooks/useResourceList
 * @description This file contains functionality related to useResourceList
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

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

import { logError } from "@/lib/firebase-error-logger";
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
/**
 * Custom React hook for resource list
 *
 * @param {UseResourceListOptions<T>} options - Configuration options
 *
 * @returns {any} The useresourcelist result
 *
 * @example
 * useResourceList(options);
 */

/**
 * Custom React hook for resource list
 *
 * @param {UseResourceListOptions<T>} /** Options */
  options - The /**  options */
  options
 *
 * @returns {any} The useresourcelist result
 *
 * @example
 * useResourceList(/** Options */
  options);
 */

/**
 * Custom React hook for resource list
 *
 * @param {UseResourceListOptions<T>} options - The options
 *
 * @returns {UseResourceListReturn<T>} The useresourcelist result
 *
 * @example
 * useResourceList(options);
 */
export function useResourceList<T = any>(
  /** Options */
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
    /** Page */
    page: initialPage,
    /** Page Size */
    pageSize: initialPageSize,
    /** Total Count */
    totalCount: 0,
    /** Total Pages */
    totalPages: 0,
    /** Has Next Page */
    hasNextPage: false,
    /** Has Previous Page */
    hasPreviousPage: false,
  });
  const [filters, setFiltersState] = useState<FilterConfig>(initialFilters);
  const [sort, setSortState] = useState<SortField | null>(initialSort);
  const [search, setSearchState] = useState<string>(initialSearch);

  // Loading state
  /**
 * Performs loading state operation
 *
 * @param {object} {
    
    initialData - The {
    
    initialdata
 *
 * @returns {any} The loadingstate result
 *
 */
const loadingState = useLoadingState<T[]>({
    /** Initial Data */
    initialData: [],
    /** On Load Success */
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
      /** Page */
      page: number,
      /** Page Size */
      pageSize: number,
      /** Current Filters */
      currentFilters: FilterConfig,
      /** Current Sort */
      currentSort: SortField | null,
      /** Current Search */
      currentSearch: string
    ): string => {
      const params = new URLSearchParams();

      // Pagination
      params.set("page", page.toString());
      params/**
 * Performs filter str operation
 *
 * @param {any} currentFilters - The currentfilters
 *
 * @returns {any} The filterstr result
 *
 */
.set("pageSize", pageSize.toString());

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
      /** Page */
      page: number,
      /** Page Size */
      pageSize: number,
      /** Current Filters */
      currentFilters: FilterConfig,
      /** Current Sort */
      currentSort: SortField | null,
      /** Current Search */
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
          /** Page */
          page: 1,
          pageSize,
          /** Total Count */
          totalCount: 0,
          /** Total Pages */
          totalPages: 0,
          /** Has Next Page */
          hasNextPage: false,
          /** Has Previous Page */
          hasPreviousPage: false,
        });

        logError(error, {
          /** Component */
          component: "useResourceList.fetchData",
          /** Metadata */
          metadata: { endpoint, page, pageSize },
        });

        if (onLoadError) {
          onLoadError(error);
        }
      }
    },
    [
      buildUrl,
      setData,
      setError,
      transformData,
      onLoadSuccess,
      onLoadError,
      endpoint,
    ]
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

  // Auto/**
 * Sets page
 *
 * @param {number} (page - The (page
 *
 * @returns {any} The setpage result
 *
 */
-fetch on mount or when dependencies change
  useEffect(() => {
    if (autoFetch) {
      loadData();
    }
  }, [pagination.page, pagination.pageSize, filters, sort, search]); // esli/**
 * Performs next page operation
 *
 * @param {any} ( - The (
 *
 * @returns {any} The nextpage result
 *
 */
nt-disable-line react-hooks/exhaustive-deps

  // ==================== PAGINATION HANDLE/**
 * Performs prev page operation
 *
 * @param {any} ( - The (
 *
 * @returns {any} The prevpage result
 *
 */
RS ====================

  const setPage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  const setPageSiz/**
 * Sets filters
 *
 * @param {FilterConfig} (newFilters - The (newfilters
 *
 * @returns {any} The setfilters result
 *
 */
e = useCallback((pageSize: number) => {
    setPagination((prev) => ({ ...pre/**
 * Updates filter
 *
 * @param {string} (key - The (key
 * @param {FilterValue} value - The value
 *
 * @returns {any} The updatefilter result
 *
 */
v, pageSize, page: 1 })); // Reset to page 1 when changing page size
  }, []);

  con/**
 * Performs clear filters operation
 *
 * @param {any} ( - The (
 *
 * @returns {any} The clearfilters result
 *
 */
st nextPage = useCallback(() => {
    setPagination((prev) => {
      if (prev.hasNextPage) {
        return { ...p/**
 * Sets sort
 *
 * @param {SortField | null} (newSort - The (newsort
 *
 * @returns {any} The setsort result
 *
 */
rev, page: prev.page + 1 };
      }
      return prev;
    });
  }, []);

  const prevPage = useCallback(() => {
    setPagination((pre/**
 * Sets search
 *
 * @param {string} (newSearch - The (newsearch
 *
 * @returns {any} The setsearch result
 *
 */
v) => {
      if (prev.hasPreviousPage) {
        return { ...prev, page: prev.page - 1 };
      }
      return prev;
    });
  }, []);

/**
 * Performs reload operation
 *
 * @param {any} async( - The async(
 *
 * @returns {Promise<any>} The reload result
 *
 */
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
      /** Page */
      page: initialPage,
      /** Page Size */
      pageSize: initialPageSize,
      /** Total Count */
      totalCount: 0,
      /** Total Pages */
      totalPages: 0,
      /** Has Next Page */
      hasNextPage: false,
      /** Has Previous Page */
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
    /** Is Initialized */
    isInitialized: loadingState.isInitialized,
    /** Is Refreshing */
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
    /** Clear Error */
    clearError: loadingState.clearError,
  };
}
