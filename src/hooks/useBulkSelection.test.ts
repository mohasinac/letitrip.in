import { act, renderHook } from "@testing-library/react";
import { useBulkSelection } from "./useBulkSelection";

describe("useBulkSelection", () => {
  const mockItems = [
    { id: "1", name: "Item 1" },
    { id: "2", name: "Item 2" },
    { id: "3", name: "Item 3" },
  ];

  it("initializes with empty selection", () => {
    const { result } = renderHook(() => useBulkSelection({ items: mockItems }));

    expect(result.current.selectedIds).toEqual([]);
    expect(result.current.selectedCount).toBe(0);
    expect(result.current.isAllSelected).toBe(false);
    expect(result.current.isSomeSelected).toBe(false);
  });

  it("initializes with initial selection", () => {
    const { result } = renderHook(() =>
      useBulkSelection({ items: mockItems, initialSelected: ["1", "2"] }),
    );

    expect(result.current.selectedIds).toEqual(["1", "2"]);
    expect(result.current.selectedCount).toBe(2);
  });

  it("checks if item is selected", () => {
    const { result } = renderHook(() =>
      useBulkSelection({ items: mockItems, initialSelected: ["1"] }),
    );

    expect(result.current.isSelected("1")).toBe(true);
    expect(result.current.isSelected("2")).toBe(false);
  });

  it("toggles single item selection", () => {
    const { result } = renderHook(() => useBulkSelection({ items: mockItems }));

    act(() => {
      result.current.toggleSelection("1");
    });

    expect(result.current.selectedIds).toEqual(["1"]);

    act(() => {
      result.current.toggleSelection("1");
    });

    expect(result.current.selectedIds).toEqual([]);
  });

  it("selects all items", () => {
    const { result } = renderHook(() => useBulkSelection({ items: mockItems }));

    act(() => {
      result.current.selectAll();
    });

    expect(result.current.selectedIds).toEqual(["1", "2", "3"]);
    expect(result.current.isAllSelected).toBe(true);
  });

  it("clears all selections", () => {
    const { result } = renderHook(() =>
      useBulkSelection({ items: mockItems, initialSelected: ["1", "2"] }),
    );

    act(() => {
      result.current.clearSelection();
    });

    expect(result.current.selectedIds).toEqual([]);
    expect(result.current.selectedCount).toBe(0);
  });

  it("toggles all items", () => {
    const { result } = renderHook(() => useBulkSelection({ items: mockItems }));

    // Select all
    act(() => {
      result.current.toggleAll();
    });

    expect(result.current.isAllSelected).toBe(true);

    // Deselect all
    act(() => {
      result.current.toggleAll();
    });

    expect(result.current.selectedIds).toEqual([]);
  });

  it("detects some selected state", () => {
    const { result } = renderHook(() => useBulkSelection({ items: mockItems }));

    act(() => {
      result.current.toggleSelection("1");
    });

    expect(result.current.isSomeSelected).toBe(true);
    expect(result.current.isAllSelected).toBe(false);
  });

  it("selects multiple items", () => {
    const { result } = renderHook(() => useBulkSelection({ items: mockItems }));

    act(() => {
      result.current.selectMultiple(["1", "2"]);
    });

    expect(result.current.selectedIds).toEqual(["1", "2"]);
  });

  it("deselects multiple items", () => {
    const { result } = renderHook(() =>
      useBulkSelection({ items: mockItems, initialSelected: ["1", "2", "3"] }),
    );

    act(() => {
      result.current.deselectMultiple(["1", "3"]);
    });

    expect(result.current.selectedIds).toEqual(["2"]);
  });

  it("gets selected items", () => {
    const { result } = renderHook(() =>
      useBulkSelection({ items: mockItems, initialSelected: ["1", "3"] }),
    );

    const selectedItems = result.current.getSelectedItems(mockItems);

    expect(selectedItems).toEqual([
      { id: "1", name: "Item 1" },
      { id: "3", name: "Item 3" },
    ]);
  });

  it("calls onSelectionChange callback", () => {
    const mockCallback = jest.fn();
    const { result } = renderHook(() =>
      useBulkSelection({ items: mockItems, onSelectionChange: mockCallback }),
    );

    act(() => {
      result.current.toggleSelection("1");
    });

    expect(mockCallback).toHaveBeenCalledWith(["1"]);
  });
});
