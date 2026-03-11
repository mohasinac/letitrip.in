/**
 * useAuctions Tests — Phase 62
 *
 * Verifies that useAuctions delegates to productService.listAuctions()
 * and returns sensible defaults.
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useAuctions } from "../useAuctions";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn((opts: any) => {
    opts.queryFn();
    return { data: null, isLoading: false, error: null, refetch: jest.fn() };
  }),
}));

jest.mock("@/services", () => ({
  productService: {
    listAuctions: jest.fn().mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      pageSize: 25,
      totalPages: 0,
      hasMore: false,
    }),
  },
}));

const { useQuery } = require("@tanstack/react-query");
const { productService } = require("@/services");

describe("useAuctions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls productService.listAuctions with undefined when no params", () => {
    renderHook(() => useAuctions());
    expect(productService.listAuctions).toHaveBeenCalledWith(undefined);
  });

  it("calls productService.listAuctions with params string", () => {
    renderHook(() => useAuctions("sort=-auctionEndDate"));
    expect(productService.listAuctions).toHaveBeenCalledWith(
      "sort=-auctionEndDate",
    );
  });

  it("uses queryKey ['auctions', ''] when no params", () => {
    renderHook(() => useAuctions());
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["auctions", ""] }),
    );
  });

  it("returns empty auctions and default totals when data is null", () => {
    const { result } = renderHook(() => useAuctions());
    expect(result.current.auctions).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.totalPages).toBe(1);
  });

  it("extracts items, total, totalPages when data is available", () => {
    const mockData = {
      items: [{ id: "a1" }],
      total: 5,
      page: 1,
      pageSize: 25,
      totalPages: 1,
      hasMore: false,
    };
    (useQuery as jest.Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    const { result } = renderHook(() => useAuctions());
    expect(result.current.auctions).toEqual(mockData.items);
    expect(result.current.total).toBe(5);
    expect(result.current.totalPages).toBe(1);
  });
});
