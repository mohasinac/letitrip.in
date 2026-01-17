"use client";

/**
 * useFilters Hook
 *
 * Framework-agnostic hook for managing filter state with optional URL synchronization
 * and localStorage persistence.
 *
 * Features:
 * - Pending state pattern (update without applying)
 * - URL synchronization via injectable router
 * - localStorage persistence
 * - Active filter detection
 * - Individual filter clearing
 * - Change callbacks
 *
 * @example
 * ```tsx
 * // Basic usage (no URL sync)
 * const { filters, appliedFilters, updateFilters, applyFilters, resetFilters } = useFilters({
 *   category: '',
 *   status: 'active',
 *   minPrice: 0
 * });
 *
 * // With URL sync (inject router)
 * const router = useRouter(); // or your router
 * const pathname = usePathname();
 * const searchParams = useSearchParams();
 *
 * const filterHook = useFilters(
 *   { category: '', status: '' },
 *   {
 *     syncWithUrl: true,
 *     router: {
 *       push: router.push,
 *       pathname,
 *       searchParams
 *     },
 *     onChange: (filters) => console.log('Filters changed:', filters)
 *   }
 * );
 *
 * // With localStorage persistence
 * const filterHook = useFilters(
 *   { category: '' },
 *   {
 *     persist: true,
 *     storageKey: 'my-filters'
 *   }
 * );
 * ```
 */

import { useCallback, useState } from "react";

export interface UseFiltersRouter {
  /** Function to navigate to a new URL */
  push: (url: string, options?: { scroll?: boolean }) => void;
  /** Current pathname */
  pathname: string;
  /** Current search params (URLSearchParams or similar) */
  searchParams:
    | URLSearchParams
    | { forEach: (callback: (value: string, key: string) => void) => void };
}

export interface UseFiltersOptions<T> {
  /** Persist filters to localStorage */
  persist?: boolean;
  /** localStorage key for persistence */
  storageKey?: string;
  /** Sync filters with URL search params (requires router) */
  syncWithUrl?: boolean;
  /** Router instance for URL synchronization */
  router?: UseFiltersRouter;
  /** Callback when filters are applied */
  onChange?: (filters: T) => void;
}

export interface UseFiltersReturn<T> {
  /** Current filter values (pending, not yet applied) */
  filters: T;
  /** Applied filter values (used for querying) */
  appliedFilters: T;
  /** Update filters without applying */
  updateFilters: (newFilters: T) => void;
  /** Apply current filters */
  applyFilters: () => void;
  /** Reset filters to initial state */
  resetFilters: () => void;
  /** Clear a specific filter */
  clearFilter: (key: keyof T) => void;
  /** Whether any filters are active */
  hasActiveFilters: boolean;
  /** Number of active filters */
  activeFilterCount: number;
}

/**
 * Hook for managing filter state with URL synchronization and persistence
 */
export function useFilters<T extends Record<string, any>>(
  initialFilters: T,
  options: UseFiltersOptions<T> = {}
): UseFiltersReturn<T> {
  // Validate initialFilters parameter
  if (!initialFilters || typeof initialFilters !== "object") {
    throw new Error("initialFilters must be a valid object");
  }

  // Validate options parameter
  if (options !== null && typeof options !== "object") {
    throw new Error("options must be an object or undefined");
  }

  const {
    persist = false,
    storageKey = "filters",
    syncWithUrl = false,
    router,
    onChange,
  } = options;

  // Validate storageKey is non-empty string
  if (
    persist &&
    (!storageKey || typeof storageKey !== "string" || storageKey.trim() === "")
  ) {
    throw new Error(
      "storageKey must be a non-empty string when persist is enabled"
    );
  }

  // Validate router when syncWithUrl is enabled
  if (syncWithUrl && !router) {
    throw new Error("router is required when syncWithUrl is enabled");
  }

  // Load initial filters from URL or localStorage
  const loadInitialFilters = useCallback((): T => {
    // First, try to load from URL if sync is enabled
    if (syncWithUrl && router?.searchParams) {
      const urlFilters: Partial<T> = {};
      router.searchParams.forEach((value, key) => {
        try {
          // Try to parse JSON for arrays/objects
          urlFilters[key as keyof T] = JSON.parse(value) as T[keyof T];
        } catch {
          // Otherwise use string value
          urlFilters[key as keyof T] = value as T[keyof T];
        }
      });
      if (Object.keys(urlFilters).length > 0) {
        return { ...initialFilters, ...urlFilters };
      }
    }

    // Then try localStorage if persist is enabled
    if (persist && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          return { ...initialFilters, ...JSON.parse(stored) };
        }
      } catch (error: any) {
        console.error("Failed to load filters from localStorage:", error);
      }
    }

    return initialFilters;
  }, [initialFilters, persist, storageKey, syncWithUrl, router]);

  const [filters, setFilters] = useState<T>(loadInitialFilters);
  const [appliedFilters, setAppliedFilters] = useState<T>(loadInitialFilters);

  // Sync filters to URL
  const syncFiltersToUrl = useCallback(
    (newFilters: T) => {
      if (!syncWithUrl || !router) return;

      // Validate pathname exists
      if (!router.pathname || typeof router.pathname !== "string") {
        return;
      }

      // Validate newFilters parameter
      if (!newFilters || typeof newFilters !== "object") {
        return;
      }

      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value) && value.length === 0) return;
          params.set(key, JSON.stringify(value));
        }
      });

      const newUrl = params.toString()
        ? `${router.pathname}?${params.toString()}`
        : router.pathname;
      router.push(newUrl, { scroll: false });
    },
    [syncWithUrl, router]
  );

  // Persist filters to localStorage
  const persistFilters = useCallback(
    (newFilters: T) => {
      if (!persist || typeof window === "undefined") return;

      // Validate newFilters parameter
      if (!newFilters || typeof newFilters !== "object") {
        return;
      }

      try {
        localStorage.setItem(storageKey, JSON.stringify(newFilters));
      } catch (error) {
        console.error("Failed to persist filters to localStorage:", error);
      }
    },
    [persist, storageKey]
  );

  // Update filters (without applying)
  const updateFilters = useCallback((newFilters: T) => {
    // Validate newFilters parameter
    if (!newFilters || typeof newFilters !== "object") {
      throw new Error("newFilters must be a valid object");
    }
    setFilters(newFilters);
  }, []);

  // Apply filters
  const applyFilters = useCallback(() => {
    setAppliedFilters(filters);
    syncFiltersToUrl(filters);
    persistFilters(filters);
    onChange?.(filters);
  }, [filters, syncFiltersToUrl, persistFilters, onChange]);

  // Reset filters
  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
    setAppliedFilters(initialFilters);
    syncFiltersToUrl(initialFilters);
    persistFilters(initialFilters);
    onChange?.(initialFilters);
  }, [initialFilters, syncFiltersToUrl, persistFilters, onChange]);

  // Clear a specific filter
  const clearFilter = useCallback(
    (key: keyof T) => {
      // Validate key exists before clearing
      if (!key || !(key in filters)) {
        return;
      }
      const newFilters = { ...filters };
      delete newFilters[key];
      setFilters(newFilters);
    },
    [filters]
  );

  // Check if filters are active
  const hasActiveFilters = Object.keys(appliedFilters).some((key) => {
    const value = appliedFilters[key];
    if (value === undefined || value === null || value === "") return false;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  });

  // Count active filters
  const activeFilterCount = Object.keys(appliedFilters).filter((key) => {
    const value = appliedFilters[key];
    if (value === undefined || value === null || value === "") return false;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }).length;

  return {
    filters,
    appliedFilters,
    updateFilters,
    applyFilters,
    resetFilters,
    clearFilter,
    hasActiveFilters,
    activeFilterCount,
  };
}
