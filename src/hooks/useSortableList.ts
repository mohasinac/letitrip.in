/**
 * useSortableList Hook
 *
 * Provides drag-and-drop sorting functionality for lists.
 * Handles reordering items and updating positions.
 *
 * @example
 * ```tsx
 * const {
 *   items,
 *   draggedIndex,
 *   handleDragStart,
 *   handleDragOver,
 *   handleDrop,
 *   handleDragEnd,
 *   moveItem,
 *   reorderItems
 * } = useSortableList({
 *   initialItems: categories,
 *   onReorder: (reordered) => updateCategories(reordered)
 * });
 * ```
 */

import { useCallback, useRef, useState } from "react";

export interface UseSortableListOptions<T> {
  /** Initial items array */
  initialItems: T[];
  /** Callback when items are reordered */
  onReorder?: (items: T[]) => void;
  /** Key property for unique identification (default: 'id') */
  keyProperty?: keyof T;
  /** Enable animations (default: true) */
  animated?: boolean;
}

export interface UseSortableListReturn<T> {
  /** Current items array */
  items: T[];
  /** Index of currently dragged item */
  draggedIndex: number | null;
  /** Handle drag start event */
  handleDragStart: (index: number) => (e: React.DragEvent) => void;
  /** Handle drag over event */
  handleDragOver: (index: number) => (e: React.DragEvent) => void;
  /** Handle drop event */
  handleDrop: (e: React.DragEvent) => void;
  /** Handle drag end event */
  handleDragEnd: (e: React.DragEvent) => void;
  /** Programmatically move item */
  moveItem: (fromIndex: number, toIndex: number) => void;
  /** Set items array */
  setItems: (items: T[]) => void;
  /** Reset to initial items */
  reset: () => void;
  /** Get item props for draggable element */
  getItemProps: (index: number) => {
    draggable: boolean;
    onDragStart: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onDragEnd: (e: React.DragEvent) => void;
    className?: string;
  };
}

export function useSortableList<T>({
  initialItems,
  onReorder,
  keyProperty = "id" as keyof T,
  animated = true,
}: UseSortableListOptions<T>): UseSortableListReturn<T> {
  const [items, setItems] = useState<T[]>(initialItems);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const dragOverIndexRef = useRef<number | null>(null);

  // Move item from one index to another
  const moveItem = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;

      const newItems = [...items];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);

      setItems(newItems);
      onReorder?.(newItems);
    },
    [items, onReorder],
  );

  // Handle drag start
  const handleDragStart = useCallback(
    (index: number) => (e: React.DragEvent) => {
      setDraggedIndex(index);
      e.dataTransfer.effectAllowed = "move";

      // Set drag image (if element exists)
      const target = e.currentTarget as HTMLElement;
      if (target) {
        e.dataTransfer.setDragImage(target, 0, 0);
      }

      // Store index in dataTransfer for compatibility
      e.dataTransfer.setData("text/plain", index.toString());
    },
    [],
  );

  // Handle drag over
  const handleDragOver = useCallback(
    (index: number) => (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";

      if (draggedIndex === null || draggedIndex === index) return;

      // Only move if we've crossed into a new item
      if (dragOverIndexRef.current !== index) {
        dragOverIndexRef.current = index;
        moveItem(draggedIndex, index);
        setDraggedIndex(index);
      }
    },
    [draggedIndex, moveItem],
  );

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragOverIndexRef.current = null;
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDraggedIndex(null);
    dragOverIndexRef.current = null;
  }, []);

  // Reset to initial items
  const reset = useCallback(() => {
    setItems(initialItems);
    setDraggedIndex(null);
  }, [initialItems]);

  // Get props for draggable item
  const getItemProps = useCallback(
    (index: number) => ({
      draggable: true,
      onDragStart: handleDragStart(index),
      onDragOver: handleDragOver(index),
      onDrop: handleDrop,
      onDragEnd: handleDragEnd,
      ...(animated && draggedIndex === index
        ? { className: "opacity-50 transition-opacity" }
        : {}),
    }),
    [
      handleDragStart,
      handleDragOver,
      handleDrop,
      handleDragEnd,
      draggedIndex,
      animated,
    ],
  );

  return {
    items,
    draggedIndex,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    moveItem,
    setItems,
    reset,
    getItemProps,
  };
}

export default useSortableList;
