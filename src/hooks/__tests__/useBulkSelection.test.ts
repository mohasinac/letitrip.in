/**
 * useBulkSelection Tests
 *
 * Verifies: initial state, toggle (select/deselect/maxSelection),
 * toggleAll (select-all / deselect-all / maxSelection cap),
 * isIndeterminate, clearSelection, and isSelected.
 */

import { renderHook, act } from "@testing-library/react";
import { useBulkSelection } from "../useBulkSelection";

interface Item {
  id: string;
  name: string;
}

const items: Item[] = [
  { id: "a", name: "Alpha" },
  { id: "b", name: "Beta" },
  { id: "c", name: "Gamma" },
];

const keyExtractor = (i: Item) => i.id;

describe("useBulkSelection", () => {
  // ──────────────────────────────────────────────────────────
  // Initial state
  // ──────────────────────────────────────────────────────────
  describe("initial state", () => {
    it("starts with an empty selection", () => {
      const { result } = renderHook(() =>
        useBulkSelection({ items, keyExtractor }),
      );

      expect(result.current.selectedIds).toEqual([]);
      expect(result.current.selectedCount).toBe(0);
      expect(result.current.isAllSelected).toBe(false);
      expect(result.current.isIndeterminate).toBe(false);
    });
  });

  // ──────────────────────────────────────────────────────────
  // toggle
  // ──────────────────────────────────────────────────────────
  describe("toggle", () => {
    it("selects an item on first toggle", () => {
      const { result } = renderHook(() =>
        useBulkSelection({ items, keyExtractor }),
      );

      act(() => result.current.toggle("a"));

      expect(result.current.selectedIds).toContain("a");
      expect(result.current.selectedCount).toBe(1);
      expect(result.current.isSelected("a")).toBe(true);
    });

    it("deselects an already-selected item on second toggle", () => {
      const { result } = renderHook(() =>
        useBulkSelection({ items, keyExtractor }),
      );

      act(() => result.current.toggle("a"));
      act(() => result.current.toggle("a"));

      expect(result.current.selectedIds).not.toContain("a");
      expect(result.current.selectedCount).toBe(0);
    });

    it("does not exceed maxSelection", () => {
      const { result } = renderHook(() =>
        useBulkSelection({ items, keyExtractor, maxSelection: 2 }),
      );

      act(() => result.current.toggle("a"));
      act(() => result.current.toggle("b"));
      act(() => result.current.toggle("c")); // should be silently ignored

      expect(result.current.selectedCount).toBe(2);
      expect(result.current.selectedIds).not.toContain("c");
    });

    it("isSelected returns false for unselected items", () => {
      const { result } = renderHook(() =>
        useBulkSelection({ items, keyExtractor }),
      );

      expect(result.current.isSelected("z")).toBe(false);
    });
  });

  // ──────────────────────────────────────────────────────────
  // toggleAll
  // ──────────────────────────────────────────────────────────
  describe("toggleAll", () => {
    it("selects all items when none are selected", () => {
      const { result } = renderHook(() =>
        useBulkSelection({ items, keyExtractor }),
      );

      act(() => result.current.toggleAll());

      expect(result.current.selectedIds).toEqual(["a", "b", "c"]);
      expect(result.current.isAllSelected).toBe(true);
    });

    it("deselects all items when all are already selected", () => {
      const { result } = renderHook(() =>
        useBulkSelection({ items, keyExtractor }),
      );

      act(() => result.current.toggleAll());
      act(() => result.current.toggleAll());

      expect(result.current.selectedIds).toEqual([]);
      expect(result.current.isAllSelected).toBe(false);
    });

    it("respects maxSelection when selecting all", () => {
      const { result } = renderHook(() =>
        useBulkSelection({ items, keyExtractor, maxSelection: 2 }),
      );

      act(() => result.current.toggleAll());

      expect(result.current.selectedCount).toBe(2);
    });

    it("deselects all even when only partial selection exists", () => {
      const { result } = renderHook(() =>
        useBulkSelection({ items, keyExtractor }),
      );

      act(() => result.current.toggle("a")); // partial
      // toggleAll when not fully-selected should select-all
      act(() => result.current.toggleAll());

      expect(result.current.isAllSelected).toBe(true);
    });
  });

  // ──────────────────────────────────────────────────────────
  // isIndeterminate
  // ──────────────────────────────────────────────────────────
  describe("isIndeterminate", () => {
    it("is true when some but not all items are selected", () => {
      const { result } = renderHook(() =>
        useBulkSelection({ items, keyExtractor }),
      );

      act(() => result.current.toggle("a"));

      expect(result.current.isIndeterminate).toBe(true);
      expect(result.current.isAllSelected).toBe(false);
    });

    it("is false when nothing is selected", () => {
      const { result } = renderHook(() =>
        useBulkSelection({ items, keyExtractor }),
      );

      expect(result.current.isIndeterminate).toBe(false);
    });

    it("is false when all items are selected", () => {
      const { result } = renderHook(() =>
        useBulkSelection({ items, keyExtractor }),
      );

      act(() => result.current.toggleAll());

      expect(result.current.isIndeterminate).toBe(false);
    });
  });

  // ──────────────────────────────────────────────────────────
  // clearSelection
  // ──────────────────────────────────────────────────────────
  describe("clearSelection", () => {
    it("resets selectedIds to empty after select-all", () => {
      const { result } = renderHook(() =>
        useBulkSelection({ items, keyExtractor }),
      );

      act(() => result.current.toggleAll());
      act(() => result.current.clearSelection());

      expect(result.current.selectedIds).toEqual([]);
      expect(result.current.selectedCount).toBe(0);
    });
  });

  // ──────────────────────────────────────────────────────────
  // setSelectedIds (direct setter)
  // ──────────────────────────────────────────────────────────
  describe("setSelectedIds", () => {
    it("replaces selection programmatically", () => {
      const { result } = renderHook(() =>
        useBulkSelection({ items, keyExtractor }),
      );

      act(() => result.current.setSelectedIds(["b", "c"]));

      expect(result.current.selectedIds).toEqual(["b", "c"]);
      expect(result.current.selectedCount).toBe(2);
    });
  });
});
