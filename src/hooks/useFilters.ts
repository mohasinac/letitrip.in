"use client";

import { logError } from "@/lib/firebase-error-logger";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

/**
 * Hook for managing filter state with URL synchronization
 * @param initialFilters - Initial filter values
 * @param options - Configuration options
 * @returns Filter state and handlers
 */
export function useFilters<T extends Record<string, any>>(
  initialFilters: T,
  options: {
    /** Persist filters to localStorage (optional) */
    persist?: boolean;
    /** Optional key to use for localStorage persistence */
    persistKey?: string;
    /** localStorage key for persistence */
    storageKey?: string;
    /** Sync filters with URL search params */
    syncWithUrl?: boolean;
    /** Callback when filters change */
    onChange?: (filters: T) => void;
  } = {}
) {
  // BUG FIX #36.1: Validate initialFilters parameter
  if (!initialFilters || typeof initialFilters !== "object") {
    throw new Error("initialFilters must be a valid object");
  }

  // BUG FIX #36.2: Validate options parameter
  if (options !== null && typeof options !== "object") {
    throw new Error("options must be an object or undefined");
  }

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    persist = false,
    storageKey = "filters",
    syncWithUrl = true,
    onChange,
  } = options;

  // BUG FIX #36.3: Validate storageKey is non-empty string
  if (
    persist &&
    (!storageKey || typeof storageKey !== "string" || storageKey.trim() === "")
  ) {
    throw new Error(
      "storageKey must be a non-empty string when persist is enabled"
    );
  }

  // Load initial filters from URL or localStorage
  const loadInitialFilters = useCallback((): T => {
    // First, try to load from URL if sync is enabled
    if (syncWithUrl && searchParams) {
      const urlFilters: Partial<T> = {};
      searchParams.forEach((value, key) => {
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
        logError(error as Error, {
          component: "useFilters.loadInitialFilters",
          metadata: { storageKey },
        });
      }
    }

    return initialFilters;
  }, [initialFilters, persist, storageKey, syncWithUrl, searchParams]);

  const [filters, setFilters] = useState<T>(loadInitialFilters);
  const [appliedFilters, setAppliedFilters] = useState<T>(loadInitialFilters);

  // Sync filters to URL
  const syncFiltersToUrl = useCallback(
    (newFilters: T) => {
      if (!syncWithUrl) return;

      // BUG FIX #36.4: Validate pathname exists
      if (!pathname || typeof pathname !== "string") {
        return;
      }

      // BUG FIX #36.5: Validate newFilters parameter
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
        ? `${pathname}?${params.toString()}`
        : pathname;
      router.push(newUrl, { scroll: false });
    },
    [syncWithUrl, pathname, router]
  );

  // Persist filters to localStorage
  const persistFilters = useCallback(
    (newFilters: T) => {
      if (!persist || typeof window === "undefined") return;

      // BUG FIX #36.6: Validate newFilters parameter
      if (!newFilters || typeof newFilters !== "object") {
        return;
      }

      try {
        localStorage.setItem(storageKey, JSON.stringify(newFilters));
      } catch (error) {
        logError(error as Error, {
          component: "useFilters.useEffect",
          metadata: { storageKey },
        });
      }
    },
    [persist, storageKey]
  );

  // Update filters (without applying)
  const updateFilters = useCallback((newFilters: T) => {
    // BUG FIX #36.7: Validate newFilters parameter
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
      // BUG FIX #36.8: Validate key exists before clearing
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
    /** Current filter values (not yet applied) */
    filters,
    /** Applied filter values (used for querying) */
    appliedFilters,
    /** Update filters without applying */
    updateFilters,
    /** Apply current filters */
    applyFilters,
    /** Reset filters to initial state */
    resetFilters,
    /** Clear a specific filter */
    clearFilter,
    /** Whether any filters are active */
    hasActiveFilters,
    /** Number of active filters */
    activeFilterCount,
  };
}
