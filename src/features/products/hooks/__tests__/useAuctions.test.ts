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

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  ...jest.requireActual("@/hooks"),
  useApiQuery: jest.fn((opts: any) => {
    opts.queryFn();
    return { data: null, isLoading: false, error: null, refetch: jest.fn() };
  }),
}));

jest.mock("@/services", () => ({
  productService: {
    listAuctions: jest.fn().mockResolvedValue({
      data: [],
      meta: { page: 1, limit: 25, total: 0, totalPages: 0 },
    }),
  },
}));

const { useApiQuery } = require("@/hooks");
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
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["auctions", ""] }),
    );
  });

  it("returns empty auctions and default totals when data is null", () => {
    const { result } = renderHook(() => useAuctions());
    expect(result.current.auctions).toEqual([]);
    expect(result.current.total).toBe(0);
    expect(result.current.totalPages).toBe(1);
  });

  it("extracts data.data, meta.total, meta.totalPages when data is available", () => {
    const mockData = {
      data: [{ id: "a1" }],
      meta: { page: 1, limit: 25, total: 5, totalPages: 1 },
    };
    (useApiQuery as jest.Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    const { result } = renderHook(() => useAuctions());
    expect(result.current.auctions).toEqual(mockData.data);
    expect(result.current.total).toBe(5);
    expect(result.current.totalPages).toBe(1);
  });
});
