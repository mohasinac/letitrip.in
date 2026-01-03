/**
 * useResourceListState Hook
 * Manages complete list/table state including loading, pagination, and filtering
 *
 * Purpose: Consolidate all list-related state management
 * Replaces: Multiple useState + useCallback calls in list pages
 *
 * @example
 * const list = useResourceListState<Product>();
 * list.setLoading(true);
 * list.setItems(products);
 * list.pagination.nextPage();
 */

import { useCallback, useState } from "react";
import {
  usePaginationState,
  UsePaginationStateReturn,
} from "./usePaginationState";

export interface ResourceListConfig {
  pageSize?: number;
  initialPage?: number;
}

export interface UseResourceListStateReturn<T> {
  // Data
  items: T[];
  loading: boolean;
  error: string | null;

  // View mode
  viewMode: "table" | "grid" | "list";

  // Filters
  filterValues: Record<string, any>;
  searchQuery: string;

  // Selection
  selectedIds: Set<string>;
  selectAll: boolean;

  // Pagination
  pagination: UsePaginationStateReturn;

  // Data setters
  setItems: (items: T[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addItems: (items: T[]) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<T>) => void;

  // View mode
  setViewMode: (mode: "table" | "grid" | "list") => void;

  // Filter actions
  setFilterValues: (filters: Record<string, any>) => void;
  updateFilter: (key: string, value: any) => void;
  clearFilters: () => void;
  setSearchQuery: (query: string) => void;

  // Selection actions
  toggleSelect: (id: string) => void;
  toggleSelectAll: (itemIds: string[]) => void;
  clearSelection: () => void;
  isSelected: (id: string) => boolean;

  // Reset
  reset: () => void;
}

export function useResourceListState<T extends { id: string }>(
  config?: ResourceListConfig
): UseResourceListStateReturn<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid" | "list">("table");
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  const pagination = usePaginationState(config);

  // Data actions
  const addItems = useCallback((newItems: T[]) => {
    setItems((prev) => [...prev, ...newItems]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<T>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  }, []);

  // Filter actions
  const updateFilter = useCallback((key: string, value: any) => {
    setFilterValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilterValues({});
    setSearchQuery("");
    pagination.reset();
  }, [pagination]);

  // Selection actions
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const toggleSelectAll = useCallback(
    (itemIds: string[]) => {
      if (selectAll) {
        setSelectedIds(new Set());
        setSelectAll(false);
      } else {
        setSelectedIds(new Set(itemIds));
        setSelectAll(true);
      }
    },
    [selectAll]
  );

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setSelectAll(false);
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  );

  const reset = useCallback(() => {
    setItems([]);
    setLoading(false);
    setError(null);
    setViewMode("table");
    setFilterValues({});
    setSearchQuery("");
    setSelectedIds(new Set());
    setSelectAll(false);
    pagination.reset();
  }, [pagination]);

  return {
    items,
    loading,
    error,
    viewMode,
    filterValues,
    searchQuery,
    selectedIds,
    selectAll,
    pagination,

    setItems,
    setLoading,
    setError,
    addItems,
    removeItem,
    updateItem,

    setViewMode,

    setFilterValues,
    updateFilter,
    clearFilters,
    setSearchQuery,

    toggleSelect,
    toggleSelectAll,
    clearSelection,
    isSelected,

    reset,
  };
}
