"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { logError } from "@/lib/firebase-error-logger";

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
  } = {},
) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    persist = false,
    storageKey = "filters",
    syncWithUrl = true,
    onChange,
  } = options;

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
    [syncWithUrl, pathname, router],
  );

  // Persist filters to localStorage
  const persistFilters = useCallback(
    (newFilters: T) => {
      if (!persist || typeof window === "undefined") return;

      try {
        localStorage.setItem(storageKey, JSON.stringify(filters));
      } catch (error) {
        logError(error as Error, {
          component: "useFilters.useEffect",
          metadata: { storageKey },
        });
      }
    },
    [persist, storageKey],
  );

  // Update filters (without applying)
  const updateFilters = useCallback((newFilters: T) => {
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
      const newFilters = { ...filters };
      delete newFilters[key];
      setFilters(newFilters);
    },
    [filters],
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
