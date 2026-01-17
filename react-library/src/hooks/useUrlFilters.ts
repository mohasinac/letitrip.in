"use client";

/**
 * useUrlFilters Hook
 *
 * Framework-agnostic hook for managing filters, sorting, and pagination in URL parameters.
 * Synchronizes state with browser URL for shareable links.
 *
 * Features:
 * - URL param synchronization via injectable router
 * - Filter management with array support
 * - Sort management (field + order)
 * - Pagination state (page + limit)
 * - Debounced URL updates
 * - Active filter counting
 * - Query string building
 *
 * @example
 * ```tsx
 * // With Next.js router
 * const router = useRouter();
 * const pathname = usePathname();
 * const searchParams = useSearchParams();
 *
 * const {
 *   filters,
 *   updateFilter,
 *   sort,
 *   setSort,
 *   page,
 *   setPage,
 *   buildQueryString
 * } = useUrlFilters({
 *   router: {
 *     push: router.push,
 *     pathname,
 *     searchParams
 *   },
 *   initialFilters: { category: '', status: '' },
 *   initialSort: { field: 'createdAt', order: 'desc' },
 *   initialPage: 1,
 *   initialLimit: 20,
 *   debounceMs: 300
 * });
 *
 * // Update URL and state
 * updateFilter('category', 'electronics');
 * setSort({ field: 'price', order: 'asc' });
 * setPage(2);
 *
 * // Build query string manually
 * const queryString = buildQueryString();
 * console.log(queryString); // "category=electronics&sort=price&order=asc&page=2"
 * ```
 */

import { useCallback, useEffect, useMemo, useState } from "react";

export interface FilterState {
  [key: string]: string | number | boolean | string[];
}

export interface SortState {
  field: string;
  order: "asc" | "desc";
}

export interface UseUrlFiltersRouter {
  /** Function to navigate to a new URL */
  push: (url: string, options?: { scroll?: boolean }) => void;
  /** Current pathname */
  pathname: string;
  /** Current search params */
  searchParams:
    | URLSearchParams
    | {
        get: (key: string) => string | null;
        getAll: (key: string) => string[];
        forEach: (callback: (value: string, key: string) => void) => void;
      };
}

export interface UseUrlFiltersOptions {
  /** Router instance for URL synchronization (required) */
  router: UseUrlFiltersRouter;
  /** Initial filter values */
  initialFilters?: FilterState;
  /** Initial sort configuration */
  initialSort?: SortState | null;
  /** Initial page number */
  initialPage?: number;
  /** Initial items per page */
  initialLimit?: number;
  /** Debounce delay for URL updates (milliseconds) */
  debounceMs?: number;
}

export interface UseUrlFiltersReturn {
  /** Current filter values */
  filters: FilterState;
  /** Current sort configuration */
  sort: SortState | null;
  /** Current page number */
  page: number;
  /** Current items per page */
  limit: number;
  /** Update a single filter */
  updateFilter: (key: string, value: any) => void;
  /** Update multiple filters at once */
  updateFilters: (newFilters: Partial<FilterState>) => void;
  /** Clear a single filter */
  clearFilter: (key: string) => void;
  /** Reset all filters to initial state */
  resetFilters: () => void;
  /** Set sort configuration */
  setSort: (sort: SortState | null) => void;
  /** Set current page */
  setPage: (page: number) => void;
  /** Set items per page */
  setLimit: (limit: number) => void;
  /** Build query string from current state */
  buildQueryString: () => string;
  /** Number of active filters */
  activeFilterCount: number;
}

/**
 * Hook for managing filters, sorting, and pagination in URL parameters
 */
export function useUrlFilters(
  options: UseUrlFiltersOptions
): UseUrlFiltersReturn {
  const {
    router,
    initialFilters = {},
    initialSort = null,
    initialPage = 1,
    initialLimit = 20,
    debounceMs = 300,
  } = options;

  // Validate router
  if (!router || !router.push || !router.pathname || !router.searchParams) {
    throw new Error("router with push, pathname, and searchParams is required");
  }

  // Initialize state from URL params
  const [filters, setFilters] = useState<FilterState>(() => {
    const urlFilters: FilterState = { ...initialFilters };
    router.searchParams.forEach((value, key) => {
      if (
        key !== "sort" &&
        key !== "order" &&
        key !== "page" &&
        key !== "limit"
      ) {
        // Handle array values (e.g., multiple categories)
        if (typeof router.searchParams.getAll === "function") {
          const allValues = router.searchParams.getAll(key);
          if (allValues.length > 1) {
            urlFilters[key] = allValues;
            return;
          }
        }
        urlFilters[key] = value;
      }
    });
    return urlFilters;
  });

  const [sort, setSort] = useState<SortState | null>(() => {
    const sortField = router.searchParams.get("sort");
    const sortOrder = router.searchParams.get("order") as "asc" | "desc" | null;
    if (sortField && sortOrder) {
      return { field: sortField, order: sortOrder };
    }
    return initialSort;
  });

  const [page, setPage] = useState<number>(() => {
    const urlPage = router.searchParams.get("page");
    const parsed = urlPage ? parseInt(urlPage, 10) : initialPage;
    return isNaN(parsed) ? initialPage : parsed;
  });

  const [limit, setLimit] = useState<number>(() => {
    const urlLimit = router.searchParams.get("limit");
    const parsed = urlLimit ? parseInt(urlLimit, 10) : initialLimit;
    return isNaN(parsed) ? initialLimit : parsed;
  });

  // Debounce timer
  const [debounceTimer, setDebounceTimer] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  // Build query string from current state
  const buildQueryString = useCallback((): string => {
    const params = new URLSearchParams();

    // Add filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, String(v)));
        } else {
          params.set(key, String(value));
        }
      }
    });

    // Add sort
    if (sort) {
      params.set("sort", sort.field);
      params.set("order", sort.order);
    }

    // Add pagination
    if (page > 1) {
      params.set("page", String(page));
    }
    if (limit !== initialLimit) {
      params.set("limit", String(limit));
    }

    return params.toString();
  }, [filters, sort, page, limit, initialLimit]);

  // Update URL when state changes (debounced)
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      const queryString = buildQueryString();
      const newUrl = queryString
        ? `${router.pathname}?${queryString}`
        : router.pathname;
      router.push(newUrl, { scroll: false });
    }, debounceMs);

    setDebounceTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sort, page, limit]);

  // Update single filter
  const updateFilter = useCallback((key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value } as FilterState));
    // Reset to page 1 when filters change
    setPage(1);
  }, []);

  // Update multiple filters
  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters } as FilterState));
    // Reset to page 1 when filters change
    setPage(1);
  }, []);

  // Clear single filter
  const clearFilter = useCallback((key: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
    // Reset to page 1 when filters change
    setPage(1);
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setPage(1);
  }, [initialFilters]);

  // Update sort (also resets page)
  const handleSetSort = useCallback((newSort: SortState | null) => {
    setSort(newSort);
    setPage(1);
  }, []);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(
      (value) => value !== "" && value !== null && value !== undefined
    ).length;
  }, [filters]);

  return {
    filters,
    sort,
    page,
    limit,
    updateFilter,
    updateFilters,
    clearFilter,
    resetFilters,
    setSort: handleSetSort,
    setPage,
    setLimit,
    buildQueryString,
    activeFilterCount,
  };
}

export default useUrlFilters;
