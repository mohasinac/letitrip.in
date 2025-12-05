/**
 * @fileoverview TypeScript Module
 * @module src/hooks/useBulkSelection
 * @description This file contains functionality related to useBulkSelection
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * useBulkSelection Hook
 *
 * Manages bulk selection state for lists with checkboxes.
 * Supports select all, select none, and individual item selection.
 *
 * @example
 * ```tsx
 * const {
 *   selectedIds,
 *   isSelected,
 *   isAllSelected,
 *   isSomeSelected,
 *   toggleSelection,
 *   toggleAll,
 *   selectAll,
 *   clearSelection,
 *   selectedCount
 * } = useBulkSelection({
 *   items: products,
 *   keyProperty: 'id'
 * });
 * ```
 */

import { useCallback, useMemo, useState } from "react";

/**
 * UseBulkSelectionOptions interface
 * 
 * @interface
 * @description Defines the structure and contract for UseBulkSelectionOptions
 */
export interface UseBulkSelectionOptions<T> {
  /** Items array to select from */
  items: T[];
  /** Key property for unique identification (default: 'id') */
  keyProperty?: keyof T;
  /** Initial selected IDs */
  initialSelected?: string[];
  /** Callback when selection changes */
  onSelectionChange?: (selectedIds: string[]) => void;
}

/**
 * UseBulkSelectionReturn interface
 * 
 * @interface
 * @description Defines the structure and contract for UseBulkSelectionReturn
 */
export interface UseBulkSelectionReturn {
  /** Array of selected item IDs */
  selectedIds: string[];
  /** Check if an item is selected */
  isSelected: (id: string) => boolean;
  /** Whether all items are selected */
  isAllSelected: boolean;
  /** Whether some (but not all) items are selected */
  isSomeSelected: boolean;
  /** Toggle selection for a single item */
  toggleSelection: (id: string) => void;
  /** Toggle all items (select all if none/some selected, deselect all if all selected) */
  toggleAll: () => void;
  /** Select all items */
  selectAll: () => void;
  /** Clear all selections */
  clearSelection: () => void;
  /** Number of selected items */
  selectedCount: number;
  /** Select multiple items by IDs */
  selectMultiple: (ids: string[]) => void;
  /** Deselect multiple items by IDs */
  deselectMultiple: (ids: string[]) => void;
  /** Get selected items */
  getSelectedItems: <T>(items: T[], keyProperty?: keyof T) => T[];
}

/**
 * Function: Use Bulk Selection
 */
/**
 * Custom React hook for bulk selection
 *
 * @returns {any} The usebulkselection result
 *
 * @example
 * useBulkSelection();
 */

/**
 * Custom React hook for bulk selection
 *
 * @returns {any} The usebulkselection result
 *
 * @example
 * useBulkSelection();
 */

export function useBulkSelection<T>({
  items,
  keyProperty = "id" as keyof T,
  initialSelected = [],
  onSelectionChange,
}: UseBulkSelectionOptions<T>): UseBulkSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelected);

  // Get all item IDs
  /**
 * Performs all ids operation
 *
 * @param {any} ( - The (
 *
 * @returns {any} The allids result
 *
 */
const allIds = useMemo(() => {
    return items.ma/**
 * Checks if selected
 *
 * @param {string} (id - The (id
 *
 * @returns {any} The isselected result
 *
 */
p((item) => String(item[keyProperty]));
  }, [items, keyPr/**
 * Checks if all selected
 *
 * @param {any} ( - The (
 *
 * @returns {any} The isallselected result
 *
 */
operty]);

  // Check if an item is selected
  const isSelected = us/**
 * Checks if some selected
 *
 * @param {any} ( - The (
 *
 * @returns {any} The issomeselected result
 *
 */
eCallback(
    (id: string) => {
      return selectedIds.includes(id);
    },
    [selectedIds]
  );

  // Check if all items are s/**
 * Updates selection
 *
 * @param {string[]} (newSelectedIds - The (newselectedids
 *
 * @returns {any} The updateselection result
 *
 */
elected
  const isAllSelected = useMemo(() => {
    return allIds.length > 0 && selectedIds.length/**
 * Performs toggle selection operation
 *
 * @param {string} (id - The (id
 *
 * @returns {any} The toggleselection result
 *
 */
 === allIds.length;
  }, [allIds, selectedIds]);

  // Check if some items are selected
  const isSomeSelected = useMemo(() => {
    return selectedIds.length > 0 && selectedIds.length < allIds.le/**
 * Performs toggle all operation
 *
 * @param {any} ( - The (
 *
 * @returns {any} The toggleall result
 *
 */
ngth;
  }, [allIds, selectedIds]);

  // Selected count
  const selectedCount = selectedIds/**
 * Performs select all operation
 *
 * @param {any} ( - The (
 *
 * @returns {any} The selectall result
 *
 */
.length;

  // Update selection with callback
  const updateSelection = useCallback(
    (newSelectedIds: string[]) => {
      setSelectedIds(/**
 * Performs select multiple operation
 *
 * @param {string[]} (ids - The (ids
 *
 * @returns {any} The selectmultiple result
 *
 */
newSelectedIds);
      onSelectionChange?.(newSelectedIds);
    },
    [onSelectionChange]
  );

  // Toggle select/**
 * Performs deselect multiple operation
 *
 * @param {string[]} (ids - The (ids
 *
 * @returns {any} The deselectmultiple result
 *
 */
ion for a single item
  const toggleSelection = useCallback(
    (id: string) => {
      const newSelectedIds = isSelected(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id];

      updateSelection(newSelectedIds);
    },
    [selectedIds, isSelected, updateSelection]
  );

  // Toggle /**
 * Performs selected set operation
 *
 * @param {any} selectedIds - The selectedids
 *
 * @returns {any} The selectedset result
 *
 */
all items
  const toggleAll = useCallback(() => {
    const newSelectedIds = isAllSelected ? [] : allIds;
    updateSelection(newSelectedIds);
  }, [isAllSelected, allIds, updateSelection]);

  // Select all items
  const selectAll = useCallback(() => {
    updateSelection(allIds);
  }, [allIds, updateSelection]);

  // Clear all selections
  const clearSelection = useCallback(() => {
    updateSelection([]);
  }, [updateSelection]);

  // Select multiple items
  const selectMultiple = useCallback(
    (ids: string[]) => {
      const newSelectedIds = [...new Set([...selectedIds, ...ids])];
      updateSelection(newSelectedIds);
    },
    [selectedIds, updateSelection]
  );

  // Deselect multiple items
  const deselectMultiple = useCallback(
    (ids: string[]) => {
      const idsSet = new Set(ids);
      const newSelectedIds = selectedIds.filter((id) => !idsSet.has(id));
      updateSelection(newSelectedIds);
    },
    [selectedIds, updateSelection]
  );

  // Get selected items
  const getSelectedItems = useCallback(
    <T>(
      /** Items */
      items: T[],
      /** Key Prop */
      keyProp: keyof T = keyProperty as unknown as keyof T
    ): T[] => {
      const selectedSet = new Set(selectedIds);
      return items.filter((item) => selectedSet.has(String(item[keyProp])));
    },
    [selectedIds, keyProperty]
  );

  return {
    selectedIds,
    isSelected,
    isAllSelected,
    isSomeSelected,
    toggleSelection,
    toggleAll,
    selectAll,
    clearSelection,
    selectedCount,
    selectMultiple,
    deselectMultiple,
    getSelectedItems,
  };
}

export default useBulkSelection;
