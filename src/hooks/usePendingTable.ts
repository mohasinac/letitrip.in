"use client";

import { useMemo } from "react";
import { usePendingFilters } from "./usePendingFilters";
import type { useUrlTable } from "./useUrlTable";

type UrlTable = ReturnType<typeof useUrlTable>;

/**
 * Minimal UrlTable-compatible interface returned as `pendingTable`.
 * Matches the UrlTable interface consumed by all *Filters components.
 */
export interface PendingTable {
  get: (key: string) => string;
  set: (key: string, value: string) => void;
  setMany: (updates: Record<string, string>) => void;
}

export interface UsePendingTableReturn {
  /** Drop-in UrlTable replacement that reads from and writes to pending state */
  pendingTable: PendingTable;
  /** Count of applied (URL) filter values — use for the filter badge */
  filterActiveCount: number;
  /** Commit all pending changes to the URL (resets page to 1) */
  onFilterApply: () => void;
  /** Clear all filter keys from pending state and URL */
  onFilterClear: () => void;
}

/**
 * usePendingTable
 *
 * A thin wrapper around `usePendingFilters` that exposes a `pendingTable`
 * object matching the `UrlTable` interface (`get`, `set`, `setMany`).
 *
 * Drop this into any listing view to replace the per-filter `useState` +
 * `useEffect` + `handleFilterApply` + `handleFilterClear` boilerplate:
 *
 * ```tsx
 * const { pendingTable, filterActiveCount, onFilterApply, onFilterClear } =
 *   usePendingTable(table, ['status', 'category', 'minPrice', 'maxPrice']);
 *
 * // Pass pendingTable directly to any *Filters component:
 * filterContent={<ProductFilters table={pendingTable} showStatus />}
 * filterActiveCount={filterActiveCount}
 * onFilterApply={onFilterApply}
 * onFilterClear={onFilterClear}
 * ```
 *
 * Values are only written to the URL when `onFilterApply` is called, matching
 * the standard staged-filter UX across all listing views.
 */
export function usePendingTable(
  table: UrlTable,
  keys: string[],
): UsePendingTableReturn {
  const filters = usePendingFilters({ table, keys });

  const pendingTable = useMemo<PendingTable>(
    () => ({
      /**
       * Returns the first pending value for `key` (or "").
       * Comma-joined tags are stored as a single element so callers get the
       * full comma-delimited string back, matching UrlTable.get() semantics.
       */
      get: (key: string): string => filters.pending[key]?.[0] ?? "",

      /**
       * Stores `value` as a one-element array in pending state.
       * An empty `value` clears the key (stored as []).
       */
      set: (key: string, value: string): void => {
        filters.set(key, value ? [value] : []);
      },

      /**
       * Batches multiple key updates into pending state.
       * React 18 auto-batches the resulting setPending calls.
       */
      setMany: (updates: Record<string, string>): void => {
        for (const [k, v] of Object.entries(updates)) {
          filters.set(k, v ? [v] : []);
        }
      },
    }),
    // filters.pending changes trigger a new pendingTable reference, which is
    // correct — child filter components need to re-render when pending changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters.pending, filters.set],
  );

  return {
    pendingTable,
    filterActiveCount: filters.appliedCount,
    onFilterApply: filters.apply,
    onFilterClear: filters.clear,
  };
}
