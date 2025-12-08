/**
 * Tests for useFilters Hook
 */

import { act, renderHook } from "@testing-library/react";
import { useFilters } from "../useFilters";

// Mock Next.js navigation hooks
const mockPush = jest.fn();
const mockPathname = "/products";
const mockSearchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

// Mock error logger
jest.mock("@/lib/firebase-error-logger", () => ({
  logError: jest.fn(),
}));

describe("useFilters Hook", () => {
  const initialFilters = {
    category: "",
    minPrice: 0,
    maxPrice: 10000,
    search: "",
  };

  beforeEach(() => {
    mockPush.mockClear();
    localStorage.clear();
  });

  describe("Basic Functionality", () => {
    it("should initialize with default filters", () => {
      const { result } = renderHook(() => useFilters(initialFilters));

      expect(result.current.filters).toEqual(initialFilters);
      expect(result.current.appliedFilters).toEqual(initialFilters);
    });

    it("should update filters without applying", () => {
      const { result } = renderHook(() => useFilters(initialFilters));

      act(() => {
        result.current.updateFilters({
          ...initialFilters,
          category: "electronics",
        });
      });

      expect(result.current.filters.category).toBe("electronics");
      expect(result.current.appliedFilters.category).toBe("");
    });

    it("should apply filters", () => {
      const { result } = renderHook(() => useFilters(initialFilters));

      act(() => {
        result.current.updateFilters({
          ...initialFilters,
          category: "electronics",
        });
      });

      act(() => {
        result.current.applyFilters();
      });

      expect(result.current.appliedFilters.category).toBe("electronics");
    });

    it("should reset filters to initial state", () => {
      const { result } = renderHook(() => useFilters(initialFilters));

      act(() => {
        result.current.updateFilters({
          ...initialFilters,
          category: "electronics",
        });
        result.current.applyFilters();
      });

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.filters).toEqual(initialFilters);
      expect(result.current.appliedFilters).toEqual(initialFilters);
    });

    it("should clear specific filter", () => {
      const { result } = renderHook(() =>
        useFilters({
          ...initialFilters,
          category: "electronics",
        })
      );

      act(() => {
        result.current.clearFilter("category");
      });

      expect(result.current.filters.category).toBeUndefined();
    });
  });

  describe("Active Filters Detection", () => {
    it("should detect no active filters", () => {
      const { result } = renderHook(() =>
        useFilters({
          category: "",
          search: "",
        })
      );

      expect(result.current.hasActiveFilters).toBe(false);
      expect(result.current.activeFilterCount).toBe(0);
    });

    it("should detect active filters", () => {
      const { result } = renderHook(() =>
        useFilters({
          ...initialFilters,
          category: "electronics",
        })
      );

      expect(result.current.hasActiveFilters).toBe(true);
      expect(result.current.activeFilterCount).toBeGreaterThan(0);
    });

    it("should ignore empty string values", () => {
      const { result } = renderHook(() =>
        useFilters({
          category: "",
          search: "",
        })
      );

      expect(result.current.hasActiveFilters).toBe(false);
    });

    it("should ignore empty arrays", () => {
      const { result } = renderHook(() =>
        useFilters({
          tags: [],
        })
      );

      expect(result.current.hasActiveFilters).toBe(false);
    });

    it("should count non-empty array filters", () => {
      const { result } = renderHook(() =>
        useFilters({
          tags: ["tag1", "tag2"],
        })
      );

      expect(result.current.hasActiveFilters).toBe(true);
      expect(result.current.activeFilterCount).toBe(1);
    });
  });

  describe("URL Synchronization", () => {
    it("should sync filters to URL when applied", () => {
      const { result } = renderHook(() =>
        useFilters(initialFilters, { syncWithUrl: true })
      );

      act(() => {
        result.current.updateFilters({
          ...initialFilters,
          category: "electronics",
        });
        result.current.applyFilters();
      });

      expect(mockPush).toHaveBeenCalled();
    });

    it("should not sync to URL when disabled", () => {
      const { result } = renderHook(() =>
        useFilters(initialFilters, { syncWithUrl: false })
      );

      act(() => {
        result.current.updateFilters({
          ...initialFilters,
          category: "electronics",
        });
        result.current.applyFilters();
      });

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("LocalStorage Persistence", () => {
    it("should persist filters to localStorage", () => {
      const storageKey = "test-filters";
      const { result } = renderHook(() =>
        useFilters(initialFilters, {
          persist: true,
          storageKey,
        })
      );

      act(() => {
        result.current.updateFilters({
          ...initialFilters,
          category: "electronics",
        });
        result.current.applyFilters();
      });

      const stored = localStorage.getItem(storageKey);
      expect(stored).toBeDefined();
    });

    it("should not persist when disabled", () => {
      const storageKey = "test-filters";
      const { result } = renderHook(() =>
        useFilters(initialFilters, {
          persist: false,
          storageKey,
        })
      );

      act(() => {
        result.current.updateFilters({
          ...initialFilters,
          category: "electronics",
        });
        result.current.applyFilters();
      });

      const stored = localStorage.getItem(storageKey);
      expect(stored).toBeNull();
    });
  });

  describe("Callbacks", () => {
    it("should call onChange when filters are applied", () => {
      const onChange = jest.fn();
      const { result } = renderHook(() =>
        useFilters(initialFilters, { onChange, syncWithUrl: false })
      );

      const newFilters = {
        ...initialFilters,
        category: "electronics",
      };

      act(() => {
        result.current.updateFilters(newFilters);
      });

      act(() => {
        result.current.applyFilters();
      });

      expect(onChange).toHaveBeenCalledWith(newFilters);
    });

    it("should call onChange when filters are reset", () => {
      const onChange = jest.fn();
      const { result } = renderHook(() =>
        useFilters(initialFilters, { onChange })
      );

      act(() => {
        result.current.resetFilters();
      });

      expect(onChange).toHaveBeenCalledWith(initialFilters);
    });
  });
});
