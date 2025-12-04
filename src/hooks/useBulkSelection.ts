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

export function useBulkSelection<T>({
  items,
  keyProperty = "id" as keyof T,
  initialSelected = [],
  onSelectionChange,
}: UseBulkSelectionOptions<T>): UseBulkSelectionReturn {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelected);

  // Get all item IDs
  const allIds = useMemo(() => {
    return items.map((item) => String(item[keyProperty]));
  }, [items, keyProperty]);

  // Check if an item is selected
  const isSelected = useCallback(
    (id: string) => {
      return selectedIds.includes(id);
    },
    [selectedIds],
  );

  // Check if all items are selected
  const isAllSelected = useMemo(() => {
    return allIds.length > 0 && selectedIds.length === allIds.length;
  }, [allIds, selectedIds]);

  // Check if some items are selected
  const isSomeSelected = useMemo(() => {
    return selectedIds.length > 0 && selectedIds.length < allIds.length;
  }, [allIds, selectedIds]);

  // Selected count
  const selectedCount = selectedIds.length;

  // Update selection with callback
  const updateSelection = useCallback(
    (newSelectedIds: string[]) => {
      setSelectedIds(newSelectedIds);
      onSelectionChange?.(newSelectedIds);
    },
    [onSelectionChange],
  );

  // Toggle selection for a single item
  const toggleSelection = useCallback(
    (id: string) => {
      const newSelectedIds = isSelected(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id];

      updateSelection(newSelectedIds);
    },
    [selectedIds, isSelected, updateSelection],
  );

  // Toggle all items
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
    [selectedIds, updateSelection],
  );

  // Deselect multiple items
  const deselectMultiple = useCallback(
    (ids: string[]) => {
      const idsSet = new Set(ids);
      const newSelectedIds = selectedIds.filter((id) => !idsSet.has(id));
      updateSelection(newSelectedIds);
    },
    [selectedIds, updateSelection],
  );

  // Get selected items
  const getSelectedItems = useCallback(
    <T>(items: T[], keyProp: keyof T = keyProperty as keyof T): T[] => {
      const selectedSet = new Set(selectedIds);
      return items.filter((item) => selectedSet.has(String(item[keyProp])));
    },
    [selectedIds, keyProperty],
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
