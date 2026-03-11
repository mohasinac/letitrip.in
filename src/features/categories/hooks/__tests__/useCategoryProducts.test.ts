/**
 * useCategoryProducts Tests — Phase 62
 *
 * Verifies that useCategoryProducts fires both queries:
 * - categoryService.list("flat=true") to resolve slug → category
 * - productService.list(params) with category filter
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useCategoryProducts } from "../useCategoryProducts";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn((opts: any) => {
    if (opts.enabled !== false) opts.queryFn?.();
    return { data: null, isLoading: false, error: null, refetch: jest.fn() };
  }),
}));

jest.mock("@/services", () => ({
  categoryService: {
    getBySlug: jest.fn().mockResolvedValue({ data: null }),
    list: jest.fn().mockResolvedValue({ data: [] }),
  },
  productService: {
    list: jest.fn().mockResolvedValue({
      data: [],
      meta: { page: 1, limit: 25, total: 0, totalPages: 0 },
    }),
  },
}));

const { useQuery } = require("@tanstack/react-query");
const { categoryService, productService } = require("@/services");

const defaultOptions = {
  sort: "-createdAt",
  page: 1,
  pageSize: 24,
  cacheKey: "key",
};

describe("useCategoryProducts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useQuery as jest.Mock).mockImplementation((opts: any) => {
      if (opts.enabled !== false) opts.queryFn?.();
      return { data: null, isLoading: false, error: null, refetch: jest.fn() };
    });
  });

  it("queries categoryService.getBySlug with the slug", () => {
    renderHook(() => useCategoryProducts("electronics", defaultOptions));
    expect(categoryService.getBySlug).toHaveBeenCalledWith("electronics");
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ["categories", "slug", "electronics"],
      }),
    );
  });

  it("queries productService.list when category is available", () => {
    const mockCat = { id: "cat-1", name: "Electronics", slug: "electronics" };
    (useQuery as jest.Mock).mockImplementation((opts: any) => {
      if (opts.queryKey[1] === "slug") {
        opts.queryFn?.();
        return { data: { data: mockCat }, isLoading: false, error: null };
      }
      opts.queryFn?.();
      return { data: null, isLoading: false, error: null };
    });
    renderHook(() => useCategoryProducts("electronics", defaultOptions));
    expect(productService.list).toHaveBeenCalled();
  });

  it("returns null category and empty products when data is null", () => {
    const { result } = renderHook(() =>
      useCategoryProducts("not-found", defaultOptions),
    );
    expect(result.current.category).toBeNull();
    expect(result.current.products).toEqual([]);
    expect(result.current.totalProducts).toBe(0);
  });

  it("resolves category from getBySlug response", () => {
    const mockCat = { id: "cat-1", name: "Electronics", slug: "electronics" };
    (useQuery as jest.Mock).mockImplementation((opts: any) => {
      if (opts.queryKey[1] === "slug") {
        return {
          data: { data: mockCat },
          isLoading: false,
          error: null,
        };
      }
      return { data: null, isLoading: false, error: null };
    });
    const { result } = renderHook(() =>
      useCategoryProducts("electronics", defaultOptions),
    );
    expect(result.current.category).toEqual(mockCat);
  });
});
