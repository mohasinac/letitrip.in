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

export interface FilterState {
  [key: string]: string | number | boolean | string[];
}

export interface SortState {
  field: string;
  order: "asc" | "desc";
}

export interface UseUrlFiltersOptions {
  initialFilters?: FilterState;
  initialSort?: SortState;
  initialPage?: number;
  initialLimit?: number;
  debounceMs?: number;
}

export interface UseUrlFiltersReturn {
  filters: FilterState;
  sort: SortState | null;
  page: number;
  limit: number;
  updateFilter: (key: string, value: any) => void;
  updateFilters: (newFilters: Partial<FilterState>) => void;
  clearFilter: (key: string) => void;
  resetFilters: () => void;
  setSort: (sort: SortState | null) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  buildQueryString: () => string;
  activeFilterCount: number;
}

export function useUrlFilters(
  options: UseUrlFiltersOptions = {},
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

  // Debounce timer
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(
    null,
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
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(newUrl, { scroll: false });
    }, debounceMs);

    setDebounceTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [filters, sort, page, limit]);

  // Update single filter
  const updateFilter = useCallback((key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    // Reset to page 1 when filters change
    setPage(1);
  }, []);

  // Update multiple filters
  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
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
      (value) => value !== "" && value !== null && value !== undefined,
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
