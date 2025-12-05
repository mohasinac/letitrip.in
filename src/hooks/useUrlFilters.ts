/**
 * @fileoverview TypeScript Module
 * @module src/hooks/useUrlFilters
 * @description This file contains functionality related to useUrlFilters
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * useUrlFilters Hook
 *
 * Manages filters, sorting, and pagination in URL parameters.
 * Synchronizes state with browser URL for shareable links.
 *
 * Features:
 * - URL param sync
 * - Filter management
 * - Sort management
 * - Pagination state
 * - History API integration
 *
 * @example
 * ```tsx
 * const { filters, updateFilter, sort, setSort, page, setPage, buildQueryString } = useUrlFilters({
 *   category: '',
 *   status: '',
 *   minPrice: '',
 *   maxPrice: ''
 * });
 *
 * // Update URL and state
 * updateFilter('category', 'electronics');
 * setSort({ field: 'price', order: 'asc' });
 * setPage(2);
 * ```
 */

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * FilterState interface
 * 
 * @interface
 * @description Defines the structure and contract for FilterState
 */
export interface FilterState {
  [key: string]: string | number | boolean | string[];
}

/**
 * SortState interface
 * 
 * @interface
 * @description Defines the structure and contract for SortState
 */
export interface SortState {
  /** Field */
  field: string;
  /** Order */
  order: "asc" | "desc";
}

/**
 * UseUrlFiltersOptions interface
 * 
 * @interface
 * @description Defines the structure and contract for UseUrlFiltersOptions
 */
export interface UseUrlFiltersOptions {
  /** Initial Filters */
  initialFilters?: FilterState;
  /** Initial Sort */
  initialSort?: SortState;
  /** Initial Page */
  initialPage?: number;
  /** Initial Limit */
  initialLimit?: number;
  /** Debounce Ms */
  debounceMs?: number;
}

/**
 * UseUrlFiltersReturn interface
 * 
 * @interface
 * @description Defines the structure and contract for UseUrlFiltersReturn
 */
export interface UseUrlFiltersReturn {
  /** Filters */
  filters: FilterState;
  /** Sort */
  sort: SortState | null;
  /** Page */
  page: number;
  /** Limit */
  limit: number;
  /** Update Filter */
  updateFilter: (key: string, value: any) => void;
  /** Update Filters */
  updateFilters: (newFilters: Partial<FilterState>) => void;
  /** Clear Filter */
  clearFilter: (key: string) => void;
  /** Reset Filters */
  resetFilters: () => void;
  /** Set Sort */
  setSort: (sort: SortState | null) => void;
  /** Set Page */
  setPage: (page: number) => void;
  /** Set Limit */
  setLimit: (limit: number) => void;
  /** Build Query String */
  buildQueryString: () => string;
  /** Active Filter Count */
  activeFilterCount: number;
}

/**
 * Function: Use Url Filters
 */
/**
 * Custom React hook for url filters
 *
 * @param {UseUrlFiltersOptions} [options] - Configuration options
 *
 * @returns {any} The useurlfilters result
 *
 * @example
 * useUrlFilters(options);
 */

/**
 * Custom React hook for url filters
 *
 * @param {UseUrlFiltersOptions} [/** Options */
  options] - The /**  options */
  options
 *
 * @returns {any} The useurlfilters result
 *
 * @example
 * useUrlFilters(/** Options */
  options);
 */

/**
 * Custom React hook for url filters
 *
 * @param {UseUrlFiltersOptions} [options] - The options
 *
 * @returns {UseUrlFiltersReturn} The useurlfilters result
 *
 * @example
 * useUrlFilters(options);
 */
export function useUrlFilters(
  /** Options */
  options: UseUrlFiltersOptions = {}
): UseUrlFiltersReturn {
  const {
    initialFilters = {},
    initialSort = null,
    initialPage = 1,
    initialLimit = 20,
    debounceMs = 300,
  } = options;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [filters, setFilters] = useState<FilterState>(() => {
    /**
 * Performs url filters operation
 *
 * @param {any} (value - The (value
 * @param {any} key - The key
 *
 * @returns {any} The urlfilters result
 *
 */
const urlFilters: FilterState = { ...initialFilters };
    searchParams.forEach((value, key) => {
      if (
        key !== "sort" &&
        key !== "order" &&
        key !== "page" &&
        key !== "limit"
      ) {
        // Handle array values (e.g., multiple categories)
        if (searchParams.getAll(key).length > 1) {
          urlFilters[key] = searchParams.getAll(key);
        } else {
          urlFilters[key] = value;
        }
      }
    });
    return urlFilters;
  });

  const [sort, setSort] = useState<SortState | null>(() => {
    const sortField = searchParams.get("sort");
    const sortOrder = searchParams.get("order") as "asc" | "desc" | null;
    if (sortField && sortOrder) {
      return { field: sortField, order: sortOrder };
    }
    return initialSort;
  });

  const [page, setPage] = useState<number>(() => {
    const urlPage = searchParams.get("page");
    return urlPage ? parseInt(urlPage, 10) : initialPage;
  });

  const [limit, setLimit] = useState<number>(() => {
    const urlLimit = searchParams.get("limit");
    return urlLimit ? parseInt(urlLimit, 10) : initialLimit;
  });

  // D/**
 * Builds query string
 *
 * @param {any} ( - The (
 *
 * @returns {string =>} The buildquerystring result
 *
 */
ebounce timer
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null
  );

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
     /**
 * Performs timer operation
 *
 * @param {any} ( - The (
 *
 * @returns {any} The timer result
 *
 */
 params.set("limit", String(limit));
    }

    return params.toString();
  }, [filters, sort, page, limit, initialLimit]);

  // Update URL when state changes (debounced)
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = /**
 * Updates filter
 *
 * @param {string} (key - The (key
 * @param {any} value - The value
 *
 * @returns {any} The updatefilter result
 *
 */
setTimeout(() => {
      const queryString = buildQueryString();
      const newUrl = queryStr/**
 * Updates filters
 *
 * @param {Partial<FilterState>} (newFilters - The (newfilters
 *
 * @returns {any} The updatefilters result
 *
 */
ing ? `${pathname}?${queryString}` : pathname;
      router.push(newUrl, { scroll: false });
    }, debou/**
 * Performs clear filter operation
 *
 * @param {string} (key - The (key
 *
 * @returns {any} The clearfilter result
 *
 */
nceMs);

    setDebounceTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [filters, sort, page, limit]);

  // Upd/**
 * Performs reset filters operation
 *
 * @param {any} ( - The (
 *
 * @returns {any} The resetfilters result
 *
 */
ate single filter
  const updateFilter = useCallback((key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value } as FilterState));
    // Reset to page 1 when fi/**
 * Performs active filter count operation
 *
 * @param {any} ( - The (
 *
 * @returns {any} The activefiltercount result
 *
 */
lters change
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
    /** Set Sort */
    setSort: handleSetSort,
    setPage,
    setLimit,
    buildQueryString,
    activeFilterCount,
  };
}

export default useUrlFilters;
