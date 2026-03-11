/**
 * useAuctionDetail Tests — Phase 62
 *
 * Verifies that useAuctionDetail bundles two queries:
 * - productService.getById(id) for product details
 * - bidService.listByProduct(id) for live bids (enabled when product is an auction)
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useAuctionDetail } from "../useAuctionDetail";

const mockProductQuery = {
  data: null,
  isLoading: false,
  error: null,
  refetch: jest.fn(),
};
const mockBidsQuery = {
  data: null,
  isLoading: false,
  error: null,
  refetch: jest.fn(),
};

let queryCallCount = 0;

jest.mock("@tanstack/react-query", () => ({
  ...jest.requireActual("@tanstack/react-query"),
  useQuery: jest.fn((opts: any) => {
    opts.queryFn?.();
    queryCallCount++;
    if (opts.queryKey[0] === "product") return mockProductQuery;
    return mockBidsQuery;
  }),
}));

jest.mock("@/services", () => ({
  productService: {
    getById: jest.fn().mockResolvedValue({ data: null }),
  },
  bidService: {
    listByProduct: jest
      .fn()
      .mockResolvedValue({ data: [], meta: { total: 0 } }),
  },
}));

const { useQuery } = require("@tanstack/react-query");
const { productService, bidService } = require("@/services");

describe("useAuctionDetail", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    queryCallCount = 0;
    mockProductQuery.data = null;
    mockBidsQuery.data = null;
  });

  it("calls productService.getById with the id", () => {
    renderHook(() => useAuctionDetail("product-123"));
    expect(productService.getById).toHaveBeenCalledWith("product-123");
  });

  it("calls bidService.listByProduct with the id", () => {
    renderHook(() => useAuctionDetail("product-123"));
    expect(bidService.listByProduct).toHaveBeenCalledWith("product-123");
  });

  it("uses queryKey ['product', id] for product query", () => {
    renderHook(() => useAuctionDetail("product-123"));
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["product", "product-123"] }),
    );
  });

  it("uses queryKey ['bids', id] for bids query", () => {
    renderHook(() => useAuctionDetail("product-123"));
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["bids", "product-123"] }),
    );
  });

  it("returns null product and empty bids when data is null", () => {
    const { result } = renderHook(() => useAuctionDetail("x"));
    expect(result.current.product).toBeNull();
    expect(result.current.bids).toEqual([]);
  });

  it("extracts product from productQuery.data.data", () => {
    const mockProduct = { id: "p1", isAuction: true };
    (mockProductQuery as any).data = { data: mockProduct };
    (useQuery as jest.Mock).mockImplementation((opts: any) => {
      if (opts.queryKey[0] === "product") return { ...mockProductQuery };
      return { ...mockBidsQuery };
    });
    const { result } = renderHook(() => useAuctionDetail("p1"));
    expect(result.current.product).toEqual(mockProduct);
  });

  it("extracts bids from bidsQuery.data.data", () => {
    const mockBids = [{ id: "b1", bidAmount: 100 }];
    (mockBidsQuery as any).data = { data: mockBids };
    (useQuery as jest.Mock).mockImplementation((opts: any) => {
      if (opts.queryKey[0] === "bids") return { ...mockBidsQuery };
      return { ...mockProductQuery };
    });
    const { result } = renderHook(() => useAuctionDetail("p1"));
    expect(result.current.bids).toEqual(mockBids);
  });

  it("passes enabled=false for bids when product is null", () => {
    renderHook(() => useAuctionDetail("p1"));
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["bids", "p1"], enabled: false }),
    );
  });
});
