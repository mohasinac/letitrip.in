import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useBulkSelection } from "../useBulkSelection";

describe("useBulkSelection Hook", () => {
  interface TestItem {
    id: string;
    name: string;
  }

  const testItems: TestItem[] = [
    { id: "1", name: "Item 1" },
    { id: "2", name: "Item 2" },
    { id: "3", name: "Item 3" },
    { id: "4", name: "Item 4" },
    { id: "5", name: "Item 5" },
  ];

  describe("Initialization", () => {
    it("should initialize with empty selection", () => {
      const { result } = renderHook(() =>
        useBulkSelection({ items: testItems })
      );

      expect(result.current.selectedIds).toEqual([]);
      expect(result.current.selectedCount).toBe(0);
      expect(result.current.isAllSelected).toBe(false);
      expect(result.current.isSomeSelected).toBe(false);
    });

    it("should initialize with provided selected IDs", () => {
      const { result } = renderHook(() =>
        useBulkSelection({
          items: testItems,
          initialSelected: ["1", "3"],
        })
      );

      expect(result.current.selectedIds).toEqual(["1", "3"]);
      expect(result.current.selectedCount).toBe(2);
      expect(result.current.isSomeSelected).toBe(true);
    });

    it("should use custom key property", () => {
      interface CustomItem {
        customId: string;
        value: string;
      }
      const items: CustomItem[] = [
        { customId: "a", value: "A" },
        { customId: "b", value: "B" },
      ];

      const { result } = renderHook(() =>
        useBulkSelection({
          items,
          keyProperty: "customId",
        })
      );

      act(() => {
        result.current.selectAll();
      });

      expect(result.current.selectedIds).toEqual(["a", "b"]);
    });

    it("should handle empty items array", () => {
      const { result } = renderHook(() => useBulkSelection({ items: [] }));

      expect(result.current.selectedIds).toEqual([]);
      expect(result.current.isAllSelected).toBe(false);
      expect(result.current.isSomeSelected).toBe(false);
    });
  });

  describe("Individual Selection", () => {
    it("should select an item", () => {
      const { result } = renderHook(() =>
        useBulkSelection({ items: testItems })
      );

      act(() => {
        result.current.toggleSelection("2");
      });

      expect(result.current.isSelected("2")).toBe(true);
      expect(result.current.selectedCount).toBe(1);
    });

    it("should deselect an item", () => {
      const { result } = renderHook(() =>
        useBulkSelection({
          items: testItems,
          initialSelected: ["1", "2"],
        })
      );

      act(() => {
        result.current.toggleSelection("2");
      });

      expect(result.current.isSelected("2")).toBe(false);
      expect(result.current.selectedIds).toEqual(["1"]);
    });

    it("should check if item is selected", () => {
      const { result } = renderHook(() =>
        useBulkSelection({
          items: testItems,
          initialSelected: ["1", "3"],
        })
      );

      expect(result.current.isSelected("1")).toBe(true);
      expect(result.current.isSelected("2")).toBe(false);
      expect(result.current.isSelected("3")).toBe(true);
    });
  });

  describe("Select All / Clear", () => {
    it("should select all items", () => {
      const { result } = renderHook(() =>
        useBulkSelection({ items: testItems })
      );

      act(() => {
        result.current.selectAll();
      });

      expect(result.current.selectedCount).toBe(5);
      expect(result.current.isAllSelected).toBe(true);
      expect(result.current.isSomeSelected).toBe(false);
    });

    it("should clear all selections", () => {
      const { result } = renderHook(() =>
        useBulkSelection({
          items: testItems,
          initialSelected: ["1", "2", "3"],
        })
      );

      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.selectedIds).toEqual([]);
      expect(result.current.selectedCount).toBe(0);
      expect(result.current.isAllSelected).toBe(false);
    });

    it("should toggle all - select all when none selected", () => {
      const { result } = renderHook(() =>
        useBulkSelection({ items: testItems })
      );

      act(() => {
        result.current.toggleAll();
      });

      expect(result.current.isAllSelected).toBe(true);
      expect(result.current.selectedCount).toBe(5);
    });

    it("should toggle all - deselect all when all selected", () => {
      const { result } = renderHook(() =>
        useBulkSelection({
          items: testItems,
          initialSelected: ["1", "2", "3", "4", "5"],
        })
      );

      act(() => {
        result.current.toggleAll();
      });

      expect(result.current.selectedIds).toEqual([]);
      expect(result.current.isAllSelected).toBe(false);
    });

    it("should toggle all - select all when some selected", () => {
      const { result } = renderHook(() =>
        useBulkSelection({
          items: testItems,
          initialSelected: ["1", "2"],
        })
      );

      act(() => {
        result.current.toggleAll();
      });

      expect(result.current.isAllSelected).toBe(true);
      expect(result.current.selectedCount).toBe(5);
    });
  });

  describe("Selection States", () => {
    it("should detect all selected state", () => {
      const { result } = renderHook(() =>
        useBulkSelection({
          items: testItems,
          initialSelected: ["1", "2", "3", "4", "5"],
        })
      );

      expect(result.current.isAllSelected).toBe(true);
      expect(result.current.isSomeSelected).toBe(false);
    });

    it("should detect some selected state", () => {
      const { result } = renderHook(() =>
        useBulkSelection({
          items: testItems,
          initialSelected: ["1", "3"],
        })
      );

      expect(result.current.isAllSelected).toBe(false);
      expect(result.current.isSomeSelected).toBe(true);
    });

    it("should detect none selected state", () => {
      const { result } = renderHook(() =>
        useBulkSelection({ items: testItems })
      );

      expect(result.current.isAllSelected).toBe(false);
      expect(result.current.isSomeSelected).toBe(false);
    });
  });

  describe("Multiple Selection", () => {
    it("should select multiple items", () => {
      const { result } = renderHook(() =>
        useBulkSelection({ items: testItems })
      );

      act(() => {
        result.current.selectMultiple(["2", "4", "5"]);
      });

      expect(result.current.selectedIds).toEqual(["2", "4", "5"]);
      expect(result.current.selectedCount).toBe(3);
    });

    it("should add to existing selection with selectMultiple", () => {
      const { result } = renderHook(() =>
        useBulkSelection({
          items: testItems,
          initialSelected: ["1"],
        })
      );

      act(() => {
        result.current.selectMultiple(["3", "5"]);
      });

      expect(result.current.selectedIds).toEqual(["1", "3", "5"]);
    });

    it("should handle duplicate IDs in selectMultiple", () => {
      const { result } = renderHook(() =>
        useBulkSelection({
          items: testItems,
          initialSelected: ["1"],
        })
      );

      act(() => {
        result.current.selectMultiple(["1", "2", "1"]);
      });

      expect(result.current.selectedIds).toEqual(["1", "2"]);
    });

    it("should deselect multiple items", () => {
      const { result } = renderHook(() =>
        useBulkSelection({
          items: testItems,
          initialSelected: ["1", "2", "3", "4"],
        })
      );

      act(() => {
        result.current.deselectMultiple(["2", "4"]);
      });

      expect(result.current.selectedIds).toEqual(["1", "3"]);
    });

    it("should handle deselectMultiple with non-selected IDs", () => {
      const { result } = renderHook(() =>
        useBulkSelection({
          items: testItems,
          initialSelected: ["1", "2"],
        })
      );

      act(() => {
        result.current.deselectMultiple(["3", "4"]);
      });

      expect(result.current.selectedIds).toEqual(["1", "2"]);
    });
  });

  describe("Get Selected Items", () => {
    it("should return selected items", () => {
      const { result } = renderHook(() =>
        useBulkSelection({
          items: testItems,
          initialSelected: ["2", "4"],
        })
      );

      const selected = result.current.getSelectedItems(testItems);

      expect(selected).toEqual([
        { id: "2", name: "Item 2" },
        { id: "4", name: "Item 4" },
      ]);
    });

    it("should return empty array when nothing selected", () => {
      const { result } = renderHook(() =>
        useBulkSelection({ items: testItems })
      );

      const selected = result.current.getSelectedItems(testItems);

      expect(selected).toEqual([]);
    });

    it("should work with custom key property", () => {
      interface CustomItem {
        customId: string;
        value: string;
      }
      const items: CustomItem[] = [
        { customId: "a", value: "A" },
        { customId: "b", value: "B" },
        { customId: "c", value: "C" },
      ];

      const { result } = renderHook(() =>
        useBulkSelection({
          items,
          keyProperty: "customId",
          initialSelected: ["a", "c"],
        })
      );

      const selected = result.current.getSelectedItems(items, "customId");

      expect(selected).toEqual([
        { customId: "a", value: "A" },
        { customId: "c", value: "C" },
      ]);
    });
  });

  describe("Callbacks", () => {
    it("should call onSelectionChange when selection changes", () => {
      const onSelectionChange = vi.fn();
      const { result } = renderHook(() =>
        useBulkSelection({
          items: testItems,
          onSelectionChange,
        })
      );

      act(() => {
        result.current.toggleSelection("3");
      });

      expect(onSelectionChange).toHaveBeenCalledWith(["3"]);
    });

    it("should call onSelectionChange on selectAll", () => {
      const onSelectionChange = vi.fn();
      const { result } = renderHook(() =>
        useBulkSelection({
          items: testItems,
          onSelectionChange,
        })
      );

      act(() => {
        result.current.selectAll();
      });

      expect(onSelectionChange).toHaveBeenCalledWith(["1", "2", "3", "4", "5"]);
    });

    it("should call onSelectionChange on clearSelection", () => {
      const onSelectionChange = vi.fn();
      const { result } = renderHook(() =>
        useBulkSelection({
          items: testItems,
          initialSelected: ["1", "2"],
          onSelectionChange,
        })
      );

      act(() => {
        result.current.clearSelection();
      });

      expect(onSelectionChange).toHaveBeenCalledWith([]);
    });
  });

  describe("Dynamic Items", () => {
    it("should update allIds when items change", () => {
      const { result, rerender } = renderHook(
        ({ items }) => useBulkSelection({ items }),
        {
          initialProps: { items: testItems.slice(0, 3) },
        }
      );

      act(() => {
        result.current.selectAll();
      });

      expect(result.current.selectedCount).toBe(3);

      rerender({ items: testItems });

      expect(result.current.isSomeSelected).toBe(true);
      expect(result.current.isAllSelected).toBe(false);
    });

    it("should maintain selection when items update", () => {
      const { result, rerender } = renderHook(
        ({ items }) =>
          useBulkSelection({
            items,
            initialSelected: ["2", "4"],
          }),
        {
          initialProps: { items: testItems },
        }
      );

      expect(result.current.selectedCount).toBe(2);

      const updatedItems = [...testItems, { id: "6", name: "Item 6" }];
      rerender({ items: updatedItems });

      expect(result.current.selectedIds).toEqual(["2", "4"]);
      expect(result.current.selectedCount).toBe(2);
    });
  });
});
