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

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn((opts: any) => {
    opts.queryFn();
    return { data: null, isLoading: false, error: null, refetch: jest.fn() };
  }),
}));

jest.mock("@/services", () => ({
  categoryService: {
    list: jest.fn().mockResolvedValue({ data: [] }),
  },
  productService: {
    list: jest.fn().mockResolvedValue({
      data: [],
      meta: { page: 1, limit: 25, total: 0, totalPages: 0 },
    }),
  },
}));

const { useApiQuery } = require("@/hooks");
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
  });

  it("queries categoryService.list with flat=true", () => {
    renderHook(() => useCategoryProducts("electronics", defaultOptions));
    expect(categoryService.list).toHaveBeenCalledWith("flat=true");
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["categories", "flat"] }),
    );
  });

  it("queries productService.list for products", () => {
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

  it("resolves category from flat category list by slug", () => {
    const mockCat = { id: "cat-1", name: "Electronics", slug: "electronics" };
    (useApiQuery as jest.Mock).mockImplementation((opts: any) => {
      if (opts.queryKey[0] === "categories") {
        return {
          data: { data: [mockCat] },
          isLoading: false,
          error: null,
          refetch: jest.fn(),
        };
      }
      return { data: null, isLoading: false, error: null, refetch: jest.fn() };
    });
    const { result } = renderHook(() =>
      useCategoryProducts("electronics", defaultOptions),
    );
    expect(result.current.category).toEqual(mockCat);
  });
});
