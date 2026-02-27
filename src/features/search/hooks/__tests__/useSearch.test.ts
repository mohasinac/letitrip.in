/**
 * useSearch Tests — Phase 62
 *
 * Verifies that useSearch delegates to searchService.query() for product results
 * and categoryService.list() for filter facets.
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useSearch } from "../useSearch";

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn((opts: any) => {
    opts.queryFn();
    return { data: null, isLoading: false, error: null };
  }),
}));

jest.mock("@/services", () => ({
  searchService: {
    query: jest
      .fn()
      .mockResolvedValue({ products: [], total: 0, totalPages: 0 }),
  },
  categoryService: {
    list: jest.fn().mockResolvedValue([]),
  },
}));

const { useApiQuery } = require("@/hooks");
const { searchService, categoryService } = require("@/services");

describe("useSearch", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useApiQuery as jest.Mock).mockImplementation((opts: any) => {
      opts.queryFn();
      return { data: null, isLoading: false, error: null };
    });
  });

  it("calls categoryService.list with 'flat=true'", () => {
    renderHook(() => useSearch("q=shoes"));
    expect(categoryService.list).toHaveBeenCalledWith("flat=true");
  });

  it("calls searchService.query with the searchParams", () => {
    renderHook(() => useSearch("q=shoes&category=footwear"));
    expect(searchService.query).toHaveBeenCalledWith(
      "q=shoes&category=footwear",
    );
  });

  it("uses queryKey ['categories', 'flat'] for categories query", () => {
    renderHook(() => useSearch("q=test"));
    const calls = (useApiQuery as jest.Mock).mock.calls;
    const catCall = calls.find(
      (c: any[]) =>
        JSON.stringify(c[0].queryKey) ===
        JSON.stringify(["categories", "flat"]),
    );
    expect(catCall).toBeDefined();
  });

  it("uses queryKey ['search', searchParams] for search query", () => {
    const params = "q=bags";
    renderHook(() => useSearch(params));
    const calls = (useApiQuery as jest.Mock).mock.calls;
    const searchCall = calls.find(
      (c: any[]) =>
        JSON.stringify(c[0].queryKey) === JSON.stringify(["search", params]),
    );
    expect(searchCall).toBeDefined();
  });

  it("returns products as empty array when no search data", () => {
    const { result } = renderHook(() => useSearch("q=nothing"));
    expect(result.current.products).toEqual([]);
  });

  it("returns products from search data", () => {
    const mockProducts = [{ id: "p-1", title: "Bag" }];
    (useApiQuery as jest.Mock).mockImplementation((opts: any) => {
      const key = JSON.stringify(opts.queryKey);
      opts.queryFn();
      if (key.includes("search")) {
        return {
          data: { items: mockProducts, total: 1, totalPages: 1 },
          isLoading: false,
        };
      }
      return { data: [], isLoading: false };
    });
    const { result } = renderHook(() => useSearch("q=bag"));
    expect(result.current.products).toEqual(mockProducts);
  });
});
