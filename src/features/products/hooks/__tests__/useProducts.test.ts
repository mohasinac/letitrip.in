/**
 * useProducts Tests — Phase 62
 *
 * Verifies that useProducts delegates to productService.list()
 * and returns sensible defaults.
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useProducts } from "../useProducts";

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn((opts: any) => {
    opts.queryFn();
    return { data: null, isLoading: false, error: null, refetch: jest.fn() };
  }),
}));

jest.mock("@/services", () => ({
  productService: {
    list: jest.fn().mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 25,
      totalPages: 0,
      hasMore: false,
    }),
  },
}));

const { useApiQuery } = require("@/hooks");
const { productService } = require("@/services");

describe("useProducts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls productService.list with undefined when no params", () => {
    renderHook(() => useProducts());
    expect(productService.list).toHaveBeenCalledWith(undefined);
  });

  it("calls productService.list with the params string", () => {
    renderHook(() => useProducts("page=2&sort=-price"));
    expect(productService.list).toHaveBeenCalledWith("page=2&sort=-price");
  });

  it("uses queryKey ['products', ''] when no params", () => {
    renderHook(() => useProducts());
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["products", ""] }),
    );
  });

  it("returns empty products and default totals when data is null", () => {
    const { result } = renderHook(() => useProducts());
    expect(result.current.products).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.totalPages).toBe(1);
  });

  it("extracts items, total, totalPages when data is available", () => {
    const mockData = {
      items: [{ id: "p1" }],
      total: 1,
      page: 1,
      pageSize: 25,
      totalPages: 1,
      hasMore: false,
    };
    (useApiQuery as jest.Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    const { result } = renderHook(() => useProducts());
    expect(result.current.products).toEqual(mockData.items);
    expect(result.current.total).toBe(1);
    expect(result.current.totalPages).toBe(1);
  });
});
