/**
 * usePendingTable Tests
 *
 * Verifies the UrlTable-compatible bridge between usePendingFilters and
 * *Filters components:
 *   - pendingTable.get() reads from pending state (not URL)
 *   - pendingTable.set() stages a value without writing to the URL
 *   - pendingTable.setMany() stages multiple values at once
 *   - onFilterApply() commits pending state to the URL
 *   - onFilterClear() clears pending state and URL
 *   - filterActiveCount reflects the number of applied (URL) values
 */

import { renderHook, act } from "@testing-library/react";
import { usePendingTable } from "../usePendingTable";

// ── Minimal UrlTable mock ──────────────────────────────────────────────────

function makeTableMock(initial: Record<string, string> = {}) {
  const store: Record<string, string> = { ...initial };

  const table = {
    get: jest.fn((key: string) => store[key] ?? ""),
    set: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    setMany: jest.fn((updates: Record<string, string>) => {
      for (const [k, v] of Object.entries(updates)) {
        store[k] = v;
      }
    }),
    getNumber: jest.fn(
      (key: string, fallback: number) => Number(store[key]) || fallback,
    ),
    setPage: jest.fn(),
    setSort: jest.fn(),
    params: new URLSearchParams(),
  };

  return { table, store };
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe("usePendingTable", () => {
  // ============================================================
  // pendingTable.get
  // ============================================================
  describe("pendingTable.get", () => {
    it("returns empty string when no value has been staged", () => {
      const { table } = makeTableMock();
      const { result } = renderHook(() =>
        usePendingTable(table as never, ["status"]),
      );
      expect(result.current.pendingTable.get("status")).toBe("");
    });

    it("returns the last staged value for a key", () => {
      const { table } = makeTableMock();
      const { result } = renderHook(() =>
        usePendingTable(table as never, ["status"]),
      );

      act(() => {
        result.current.pendingTable.set("status", "active");
      });

      expect(result.current.pendingTable.get("status")).toBe("active");
    });

    it("pre-fills from the URL on mount", () => {
      const { table } = makeTableMock({ status: "pending" });
      const { result } = renderHook(() =>
        usePendingTable(table as never, ["status"]),
      );
      expect(result.current.pendingTable.get("status")).toBe("pending");
    });
  });

  // ============================================================
  // pendingTable.set
  // ============================================================
  describe("pendingTable.set", () => {
    it("stages a value without calling table.setMany / table.set", () => {
      const { table } = makeTableMock();
      const { result } = renderHook(() =>
        usePendingTable(table as never, ["role"]),
      );

      act(() => {
        result.current.pendingTable.set("role", "admin");
      });

      // URL should NOT have been updated yet
      expect(table.setMany).not.toHaveBeenCalled();
      expect(table.set).not.toHaveBeenCalled();
    });

    it("clearing a key (empty string) removes it from pending state", () => {
      const { table } = makeTableMock({ status: "active" });
      const { result } = renderHook(() =>
        usePendingTable(table as never, ["status"]),
      );

      act(() => {
        result.current.pendingTable.set("status", "");
      });

      expect(result.current.pendingTable.get("status")).toBe("");
    });
  });

  // ============================================================
  // pendingTable.setMany
  // ============================================================
  describe("pendingTable.setMany", () => {
    it("stages multiple values at once without writing to the URL", () => {
      const { table } = makeTableMock();
      const { result } = renderHook(() =>
        usePendingTable(table as never, ["status", "category"]),
      );

      act(() => {
        result.current.pendingTable.setMany({
          status: "published",
          category: "electronics",
        });
      });

      expect(result.current.pendingTable.get("status")).toBe("published");
      expect(result.current.pendingTable.get("category")).toBe("electronics");
      expect(table.setMany).not.toHaveBeenCalled();
      expect(table.set).not.toHaveBeenCalled();
    });
  });

  // ============================================================
  // onFilterApply
  // ============================================================
  describe("onFilterApply", () => {
    it("commits pending values to the URL via table.setMany", () => {
      const { table } = makeTableMock();
      const { result } = renderHook(() =>
        usePendingTable(table as never, ["status", "role"]),
      );

      act(() => {
        result.current.pendingTable.set("status", "active");
        result.current.pendingTable.set("role", "seller");
      });

      act(() => {
        result.current.onFilterApply();
      });

      expect(table.setMany).toHaveBeenCalledWith(
        expect.objectContaining({ status: "active", role: "seller" }),
      );
    });

    it("passing an empty value resets that key in the URL", () => {
      const { table } = makeTableMock({ status: "active" });
      const { result } = renderHook(() =>
        usePendingTable(table as never, ["status"]),
      );

      // set and apply must be separate acts so the state update from set
      // is committed before apply reads pending
      act(() => {
        result.current.pendingTable.set("status", "");
      });

      act(() => {
        result.current.onFilterApply();
      });

      expect(table.setMany).toHaveBeenCalledWith(
        expect.objectContaining({ status: "" }),
      );
    });
  });

  // ============================================================
  // onFilterClear
  // ============================================================
  describe("onFilterClear", () => {
    it("clears all pending state and clears all keys in the URL", () => {
      const { table } = makeTableMock({ status: "active", role: "admin" });
      const { result } = renderHook(() =>
        usePendingTable(table as never, ["status", "role"]),
      );

      act(() => {
        result.current.onFilterClear();
      });

      expect(result.current.pendingTable.get("status")).toBe("");
      expect(result.current.pendingTable.get("role")).toBe("");
      expect(table.setMany).toHaveBeenCalledWith(
        expect.objectContaining({ status: "", role: "" }),
      );
    });
  });

  // ============================================================
  // filterActiveCount
  // ============================================================
  describe("filterActiveCount", () => {
    it("is 0 when no URL filters are set", () => {
      const { table } = makeTableMock();
      const { result } = renderHook(() =>
        usePendingTable(table as never, ["status", "role"]),
      );
      expect(result.current.filterActiveCount).toBe(0);
    });

    it("counts only applied (URL) values, not staged ones", () => {
      // Two keys in the URL
      const { table } = makeTableMock({ status: "active", category: "books" });
      const { result } = renderHook(() =>
        usePendingTable(table as never, ["status", "category"]),
      );

      // Stage a third key without applying
      act(() => {
        result.current.pendingTable.set("category", "electronics");
      });

      // appliedCount should still reflect what is in the URL (2)
      expect(result.current.filterActiveCount).toBe(2);
    });
  });
});
