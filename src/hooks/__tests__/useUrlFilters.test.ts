/**
 * Unit Tests for useUrlFilters Hook
 *
 * Tests comprehensive URL filter management with sorting and pagination.
 * Covers edge cases, debouncing, and URL synchronization.
 */

import { act, renderHook, waitFor } from "@testing-library/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useUrlFilters } from "../useUrlFilters";

// Mock Next.js navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockUseSearchParams = useSearchParams as jest.MockedFunction<
  typeof useSearchParams
>;

describe("useUrlFilters", () => {
  const mockPush = jest.fn();
  const mockPathname = "/products";

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    } as any);

    mockUsePathname.mockReturnValue(mockPathname);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const createMockSearchParams = (
    params: Record<string, string | string[]>
  ) => {
    const urlSearchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => urlSearchParams.append(key, v));
      } else {
        urlSearchParams.set(key, value);
      }
    });

    return {
      get: (key: string) => urlSearchParams.get(key),
      getAll: (key: string) => urlSearchParams.getAll(key),
      forEach: (callback: (value: string, key: string) => void) =>
        urlSearchParams.forEach(callback),
      has: (key: string) => urlSearchParams.has(key),
      keys: () => urlSearchParams.keys(),
      values: () => urlSearchParams.values(),
      entries: () => urlSearchParams.entries(),
      toString: () => urlSearchParams.toString(),
    } as any;
  };

  describe("Initialization", () => {
    it("should initialize with default values", () => {
      mockUseSearchParams.mockReturnValue(createMockSearchParams({}));

      const { result } = renderHook(() => useUrlFilters());

      expect(result.current.filters).toEqual({});
      expect(result.current.sort).toBeNull();
      expect(result.current.page).toBe(1);
      expect(result.current.limit).toBe(20);
      expect(result.current.activeFilterCount).toBe(0);
    });

    it("should initialize with custom initial values", () => {
      mockUseSearchParams.mockReturnValue(createMockSearchParams({}));

      const { result } = renderHook(() =>
        useUrlFilters({
          initialFilters: { category: "electronics", status: "active" },
          initialSort: { field: "price", order: "asc" },
          initialPage: 2,
          initialLimit: 50,
        })
      );

      expect(result.current.filters).toEqual({
        category: "electronics",
        status: "active",
      });
      expect(result.current.sort).toEqual({ field: "price", order: "asc" });
      expect(result.current.page).toBe(2);
      expect(result.current.limit).toBe(50);
    });

    it("should initialize from URL parameters", () => {
      mockUseSearchParams.mockReturnValue(
        createMockSearchParams({
          category: "electronics",
          status: "active",
          sort: "price",
          order: "desc",
          page: "3",
          limit: "30",
        })
      );

      const { result } = renderHook(() => useUrlFilters());

      expect(result.current.filters).toEqual({
        category: "electronics",
        status: "active",
      });
      expect(result.current.sort).toEqual({ field: "price", order: "desc" });
      expect(result.current.page).toBe(3);
      expect(result.current.limit).toBe(30);
    });

    it("should handle array values in URL parameters", () => {
      mockUseSearchParams.mockReturnValue(
        createMockSearchParams({
          tags: ["tag1", "tag2", "tag3"],
        })
      );

      const { result } = renderHook(() => useUrlFilters());

      expect(result.current.filters.tags).toEqual(["tag1", "tag2", "tag3"]);
    });

    it("should prefer URL params over initial values", () => {
      mockUseSearchParams.mockReturnValue(
        createMockSearchParams({
          category: "from-url",
        })
      );

      const { result } = renderHook(() =>
        useUrlFilters({
          initialFilters: { category: "from-initial" },
        })
      );

      expect(result.current.filters.category).toBe("from-url");
    });

    it("should handle invalid page number in URL", () => {
      mockUseSearchParams.mockReturnValue(
        createMockSearchParams({
          page: "invalid",
        })
      );

      const { result } = renderHook(() => useUrlFilters());

      // Should fallback to initialPage (1) instead of NaN
      expect(result.current.page).toBe(1);
    });

    it("should handle invalid limit number in URL", () => {
      mockUseSearchParams.mockReturnValue(
        createMockSearchParams({
          limit: "invalid",
        })
      );

      const { result } = renderHook(() => useUrlFilters());

      // Should fallback to initialLimit (20) instead of NaN
      expect(result.current.limit).toBe(20);
    });

    it("should handle sort without order in URL", () => {
      mockUseSearchParams.mockReturnValue(
        createMockSearchParams({
          sort: "price",
        })
      );

      const { result } = renderHook(() => useUrlFilters());

      expect(result.current.sort).toBeNull();
    });

    it("should handle order without sort in URL", () => {
      mockUseSearchParams.mockReturnValue(
        createMockSearchParams({
          order: "asc",
        })
      );

      const { result } = renderHook(() => useUrlFilters());

      expect(result.current.sort).toBeNull();
    });
  });

  describe("Filter Management", () => {
    beforeEach(() => {
      mockUseSearchParams.mockReturnValue(createMockSearchParams({}));
    });

    it("should update single filter", () => {
      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.updateFilter("category", "electronics");
      });

      expect(result.current.filters.category).toBe("electronics");
    });

    it("should update multiple filters at once", () => {
      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.updateFilters({
          category: "electronics",
          status: "active",
          minPrice: "100",
        });
      });

      expect(result.current.filters).toMatchObject({
        category: "electronics",
        status: "active",
        minPrice: "100",
      });
    });

    it("should clear single filter", () => {
      const { result } = renderHook(() =>
        useUrlFilters({
          initialFilters: { category: "electronics", status: "active" },
        })
      );

      act(() => {
        result.current.clearFilter("category");
      });

      expect(result.current.filters.category).toBeUndefined();
      expect(result.current.filters.status).toBe("active");
    });

    it("should reset all filters", () => {
      const initialFilters = { category: "default" };
      const { result } = renderHook(() =>
        useUrlFilters({
          initialFilters,
        })
      );

      act(() => {
        result.current.updateFilter("category", "electronics");
        result.current.updateFilter("status", "active");
      });

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.filters).toEqual(initialFilters);
    });

    it("should reset to page 1 when updating filter", () => {
      const { result } = renderHook(() =>
        useUrlFilters({
          initialPage: 5,
        })
      );

      act(() => {
        result.current.updateFilter("category", "electronics");
      });

      expect(result.current.page).toBe(1);
    });

    it("should reset to page 1 when updating multiple filters", () => {
      const { result } = renderHook(() =>
        useUrlFilters({
          initialPage: 5,
        })
      );

      act(() => {
        result.current.updateFilters({ category: "electronics" });
      });

      expect(result.current.page).toBe(1);
    });

    it("should reset to page 1 when clearing filter", () => {
      const { result } = renderHook(() =>
        useUrlFilters({
          initialFilters: { category: "electronics" },
          initialPage: 5,
        })
      );

      act(() => {
        result.current.clearFilter("category");
      });

      expect(result.current.page).toBe(1);
    });

    it("should reset to page 1 when resetting filters", () => {
      const { result } = renderHook(() =>
        useUrlFilters({
          initialPage: 5,
        })
      );

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.page).toBe(1);
    });

    it("should handle boolean filter values", () => {
      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.updateFilter("inStock", true);
      });

      expect(result.current.filters.inStock).toBe(true);
    });

    it("should handle number filter values", () => {
      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.updateFilter("minPrice", 100);
      });

      expect(result.current.filters.minPrice).toBe(100);
    });

    it("should handle array filter values", () => {
      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.updateFilter("tags", ["tag1", "tag2"]);
      });

      expect(result.current.filters.tags).toEqual(["tag1", "tag2"]);
    });

    it("should overwrite existing filter value", () => {
      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.updateFilter("category", "electronics");
      });

      act(() => {
        result.current.updateFilter("category", "books");
      });

      expect(result.current.filters.category).toBe("books");
    });
  });

  describe("Sort Management", () => {
    beforeEach(() => {
      mockUseSearchParams.mockReturnValue(createMockSearchParams({}));
    });

    it("should set sort state", () => {
      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.setSort({ field: "price", order: "asc" });
      });

      expect(result.current.sort).toEqual({ field: "price", order: "asc" });
    });

    it("should clear sort state", () => {
      const { result } = renderHook(() =>
        useUrlFilters({
          initialSort: { field: "price", order: "asc" },
        })
      );

      act(() => {
        result.current.setSort(null);
      });

      expect(result.current.sort).toBeNull();
    });

    it("should reset to page 1 when setting sort", () => {
      const { result } = renderHook(() =>
        useUrlFilters({
          initialPage: 5,
        })
      );

      act(() => {
        result.current.setSort({ field: "price", order: "asc" });
      });

      expect(result.current.page).toBe(1);
    });

    it("should handle sort order change", () => {
      const { result } = renderHook(() =>
        useUrlFilters({
          initialSort: { field: "price", order: "asc" },
        })
      );

      act(() => {
        result.current.setSort({ field: "price", order: "desc" });
      });

      expect(result.current.sort?.order).toBe("desc");
    });

    it("should handle sort field change", () => {
      const { result } = renderHook(() =>
        useUrlFilters({
          initialSort: { field: "price", order: "asc" },
        })
      );

      act(() => {
        result.current.setSort({ field: "date", order: "asc" });
      });

      expect(result.current.sort?.field).toBe("date");
    });
  });

  describe("Pagination Management", () => {
    beforeEach(() => {
      mockUseSearchParams.mockReturnValue(createMockSearchParams({}));
    });

    it("should set page", () => {
      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.setPage(5);
      });

      expect(result.current.page).toBe(5);
    });

    it("should set limit", () => {
      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.setLimit(50);
      });

      expect(result.current.limit).toBe(50);
    });

    it("should handle page 0", () => {
      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.setPage(0);
      });

      expect(result.current.page).toBe(0);
    });

    it("should handle negative page", () => {
      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.setPage(-1);
      });

      expect(result.current.page).toBe(-1);
    });

    it("should handle large page numbers", () => {
      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.setPage(999999);
      });

      expect(result.current.page).toBe(999999);
    });
  });

  describe("Query String Building", () => {
    beforeEach(() => {
      mockUseSearchParams.mockReturnValue(createMockSearchParams({}));
    });

    it("should build empty query string with no filters", () => {
      const { result } = renderHook(() => useUrlFilters());

      const queryString = result.current.buildQueryString();

      expect(queryString).toBe("");
    });

    it("should build query string with filters", () => {
      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.updateFilter("category", "electronics");
        result.current.updateFilter("status", "active");
      });

      const queryString = result.current.buildQueryString();

      expect(queryString).toContain("category=electronics");
      expect(queryString).toContain("status=active");
    });

    it("should build query string with sort", () => {
      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.setSort({ field: "price", order: "asc" });
      });

      const queryString = result.current.buildQueryString();

      expect(queryString).toContain("sort=price");
      expect(queryString).toContain("order=asc");
    });

    it("should build query string with pagination", () => {
      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.setPage(2);
        result.current.setLimit(50);
      });

      const queryString = result.current.buildQueryString();

      expect(queryString).toContain("page=2");
      expect(queryString).toContain("limit=50");
    });

    it("should not include page 1 in query string", () => {
      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.setPage(1);
      });

      const queryString = result.current.buildQueryString();

      expect(queryString).not.toContain("page=");
    });

    it("should not include default limit in query string", () => {
      const { result } = renderHook(() =>
        useUrlFilters({
          initialLimit: 20,
        })
      );

      act(() => {
        result.current.setLimit(20);
      });

      const queryString = result.current.buildQueryString();

      expect(queryString).not.toContain("limit=");
    });

    it("should handle array values in query string", () => {
      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.updateFilter("tags", ["tag1", "tag2"]);
      });

      const queryString = result.current.buildQueryString();

      expect(queryString).toContain("tags=tag1");
      expect(queryString).toContain("tags=tag2");
    });

    it("should not include empty string filters", () => {
      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.updateFilter("category", "");
      });

      const queryString = result.current.buildQueryString();

      expect(queryString).not.toContain("category=");
    });

    it("should not include null filters", () => {
      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.updateFilter("category", null);
      });

      const queryString = result.current.buildQueryString();

      expect(queryString).not.toContain("category=");
    });

    it("should not include undefined filters", () => {
      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.updateFilter("category", undefined);
      });

      const queryString = result.current.buildQueryString();

      expect(queryString).not.toContain("category=");
    });

    it("should handle boolean values in query string", () => {
      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.updateFilter("inStock", true);
      });

      const queryString = result.current.buildQueryString();

      expect(queryString).toContain("inStock=true");
    });

    it("should handle number values in query string", () => {
      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.updateFilter("minPrice", 100);
      });

      const queryString = result.current.buildQueryString();

      expect(queryString).toContain("minPrice=100");
    });

    it("should handle zero values in query string", () => {
      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.updateFilter("minPrice", 0);
      });

      const queryString = result.current.buildQueryString();

      expect(queryString).toContain("minPrice=0");
    });
  });

  describe("URL Synchronization", () => {
    beforeEach(() => {
      mockUseSearchParams.mockReturnValue(createMockSearchParams({}));
    });

    it("should push URL when filters change", async () => {
      const { result } = renderHook(() =>
        useUrlFilters({
          debounceMs: 100,
        })
      );

      act(() => {
        result.current.updateFilter("category", "electronics");
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining("category=electronics"),
          { scroll: false }
        );
      });
    });

    it("should push URL when sort changes", async () => {
      const { result } = renderHook(() =>
        useUrlFilters({
          debounceMs: 100,
        })
      );

      act(() => {
        result.current.setSort({ field: "price", order: "asc" });
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining("sort=price"),
          { scroll: false }
        );
      });
    });

    it("should push URL when page changes", async () => {
      const { result } = renderHook(() =>
        useUrlFilters({
          debounceMs: 100,
        })
      );

      act(() => {
        result.current.setPage(2);
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining("page=2"),
          { scroll: false }
        );
      });
    });

    it("should not scroll when pushing URL", async () => {
      const { result } = renderHook(() =>
        useUrlFilters({
          debounceMs: 100,
        })
      );

      act(() => {
        result.current.updateFilter("category", "electronics");
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(expect.any(String), {
          scroll: false,
        });
      });
    });

    it("should push pathname without query string when no params", async () => {
      const { result } = renderHook(() =>
        useUrlFilters({
          debounceMs: 100,
        })
      );

      // Initial render will trigger URL update
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(mockPathname, { scroll: false });
      });
    });
  });

  describe("Debouncing", () => {
    beforeEach(() => {
      mockUseSearchParams.mockReturnValue(createMockSearchParams({}));
    });

    it("should debounce URL updates with default delay", async () => {
      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.updateFilter("category", "electronics");
      });

      // Should not push immediately
      expect(mockPush).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(300);
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledTimes(1);
      });
    });

    it("should debounce URL updates with custom delay", async () => {
      const { result } = renderHook(() =>
        useUrlFilters({
          debounceMs: 500,
        })
      );

      act(() => {
        result.current.updateFilter("category", "electronics");
      });

      act(() => {
        jest.advanceTimersByTime(400);
      });

      expect(mockPush).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledTimes(1);
      });
    });

    it("should reset debounce timer on rapid changes", async () => {
      const { result } = renderHook(() =>
        useUrlFilters({
          debounceMs: 300,
        })
      );

      act(() => {
        result.current.updateFilter("category", "electronics");
      });

      act(() => {
        jest.advanceTimersByTime(200);
      });

      act(() => {
        result.current.updateFilter("category", "books");
      });

      act(() => {
        jest.advanceTimersByTime(200);
      });

      // Should not have pushed yet
      expect(mockPush).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledTimes(1);
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining("category=books"),
          { scroll: false }
        );
      });
    });

    it("should cleanup debounce timer on unmount", () => {
      const { unmount } = renderHook(() => useUrlFilters());

      unmount();

      // Should not throw error
      act(() => {
        jest.advanceTimersByTime(1000);
      });
    });
  });

  describe("Active Filter Count", () => {
    beforeEach(() => {
      mockUseSearchParams.mockReturnValue(createMockSearchParams({}));
    });

    it("should count active filters correctly", () => {
      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.updateFilter("category", "electronics");
        result.current.updateFilter("status", "active");
      });

      expect(result.current.activeFilterCount).toBe(2);
    });

    it("should not count empty string filters", () => {
      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.updateFilter("category", "electronics");
        result.current.updateFilter("status", "");
      });

      expect(result.current.activeFilterCount).toBe(1);
    });

    it("should not count null filters", () => {
      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.updateFilter("category", "electronics");
        result.current.updateFilter("status", null);
      });

      expect(result.current.activeFilterCount).toBe(1);
    });

    it("should not count undefined filters", () => {
      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.updateFilter("category", "electronics");
        result.current.updateFilter("status", undefined);
      });

      expect(result.current.activeFilterCount).toBe(1);
    });

    it("should count boolean filters", () => {
      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.updateFilter("inStock", true);
      });

      expect(result.current.activeFilterCount).toBe(1);
    });

    it("should count number filters including zero", () => {
      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.updateFilter("minPrice", 0);
      });

      expect(result.current.activeFilterCount).toBe(1);
    });

    it("should count array filters", () => {
      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.updateFilter("tags", ["tag1", "tag2"]);
      });

      expect(result.current.activeFilterCount).toBe(1);
    });

    it("should update count when filters are cleared", () => {
      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.updateFilter("category", "electronics");
        result.current.updateFilter("status", "active");
      });

      expect(result.current.activeFilterCount).toBe(2);

      act(() => {
        result.current.clearFilter("category");
      });

      expect(result.current.activeFilterCount).toBe(1);
    });

    it("should reset count when all filters are reset", () => {
      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.updateFilter("category", "electronics");
        result.current.updateFilter("status", "active");
      });

      expect(result.current.activeFilterCount).toBe(2);

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.activeFilterCount).toBe(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle rapid filter updates", () => {
      mockUseSearchParams.mockReturnValue(createMockSearchParams({}));

      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.updateFilter("category", `value-${i}`);
        }
      });

      expect(result.current.filters.category).toBe("value-99");
    });

    it("should handle special characters in filter values", async () => {
      mockUseSearchParams.mockReturnValue(createMockSearchParams({}));

      const { result } = renderHook(() =>
        useUrlFilters({
          debounceMs: 100,
        })
      );

      act(() => {
        result.current.updateFilter("query", "test & special = value");
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining("query="),
          { scroll: false }
        );
      });
    });

    it("should handle very long filter values", () => {
      mockUseSearchParams.mockReturnValue(createMockSearchParams({}));

      const { result } = renderHook(() => useUrlFilters());

      const longValue = "a".repeat(1000);

      act(() => {
        result.current.updateFilter("description", longValue);
      });

      expect(result.current.filters.description).toBe(longValue);
    });

    it("should handle many filters simultaneously", () => {
      mockUseSearchParams.mockReturnValue(createMockSearchParams({}));

      const { result } = renderHook(() => useUrlFilters());

      const manyFilters: Record<string, string> = {};
      for (let i = 0; i < 50; i++) {
        manyFilters[`filter${i}`] = `value${i}`;
      }

      act(() => {
        result.current.updateFilters(manyFilters);
      });

      expect(Object.keys(result.current.filters).length).toBe(50);
    });

    it("should handle empty array in filter", () => {
      mockUseSearchParams.mockReturnValue(createMockSearchParams({}));

      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.updateFilter("tags", []);
      });

      expect(result.current.filters.tags).toEqual([]);
    });

    it("should handle deeply nested pathname", async () => {
      mockUsePathname.mockReturnValue("/category/subcategory/products");
      mockUseSearchParams.mockReturnValue(createMockSearchParams({}));

      const { result } = renderHook(() =>
        useUrlFilters({
          debounceMs: 100,
        })
      );

      act(() => {
        result.current.updateFilter("status", "active");
      });

      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining("/category/subcategory/products"),
          { scroll: false }
        );
      });
    });

    it("should handle concurrent filter and sort updates", () => {
      mockUseSearchParams.mockReturnValue(createMockSearchParams({}));

      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.updateFilter("category", "electronics");
        result.current.setSort({ field: "price", order: "asc" });
        result.current.setPage(2);
      });

      // All updates should be reflected with final page value
      expect(result.current.filters.category).toBe("electronics");
      expect(result.current.sort).toEqual({ field: "price", order: "asc" });
      // Page is set last, so it should be 2 (setPage doesn't reset itself)
      expect(result.current.page).toBe(2);
    });

    it("should handle filter key with dot notation", () => {
      mockUseSearchParams.mockReturnValue(createMockSearchParams({}));

      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.updateFilter("user.name", "John");
      });

      expect(result.current.filters["user.name"]).toBe("John");
    });

    it("should handle numeric string filter values", () => {
      mockUseSearchParams.mockReturnValue(createMockSearchParams({}));

      const { result } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.updateFilter("code", "123456");
      });

      expect(result.current.filters.code).toBe("123456");
      expect(typeof result.current.filters.code).toBe("string");
    });
  });

  describe("Memory Management", () => {
    it("should cleanup timer on unmount during debounce", () => {
      mockUseSearchParams.mockReturnValue(createMockSearchParams({}));

      const { result, unmount } = renderHook(() => useUrlFilters());

      act(() => {
        result.current.updateFilter("category", "electronics");
      });

      unmount();

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should not throw or call push after unmount
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("should handle multiple debounce timer updates", () => {
      mockUseSearchParams.mockReturnValue(createMockSearchParams({}));

      const { result } = renderHook(() =>
        useUrlFilters({
          debounceMs: 300,
        })
      );

      act(() => {
        result.current.updateFilter("a", "1");
        result.current.updateFilter("b", "2");
        result.current.updateFilter("c", "3");
      });

      act(() => {
        jest.advanceTimersByTime(300);
      });

      // Should only call push once after all updates settle
      expect(mockPush).toHaveBeenCalledTimes(1);
    });
  });

  describe("Type Safety and Return Values", () => {
    it("should return all expected properties", () => {
      mockUseSearchParams.mockReturnValue(createMockSearchParams({}));

      const { result } = renderHook(() => useUrlFilters());

      expect(result.current).toHaveProperty("filters");
      expect(result.current).toHaveProperty("sort");
      expect(result.current).toHaveProperty("page");
      expect(result.current).toHaveProperty("limit");
      expect(result.current).toHaveProperty("updateFilter");
      expect(result.current).toHaveProperty("updateFilters");
      expect(result.current).toHaveProperty("clearFilter");
      expect(result.current).toHaveProperty("resetFilters");
      expect(result.current).toHaveProperty("setSort");
      expect(result.current).toHaveProperty("setPage");
      expect(result.current).toHaveProperty("setLimit");
      expect(result.current).toHaveProperty("buildQueryString");
      expect(result.current).toHaveProperty("activeFilterCount");
    });

    it("should maintain function references across renders", () => {
      mockUseSearchParams.mockReturnValue(createMockSearchParams({}));

      const { result, rerender } = renderHook(() => useUrlFilters());

      const initialUpdateFilter = result.current.updateFilter;
      const initialSetSort = result.current.setSort;

      rerender();

      expect(result.current.updateFilter).toBe(initialUpdateFilter);
      expect(result.current.setSort).toBe(initialSetSort);
    });
  });
});
