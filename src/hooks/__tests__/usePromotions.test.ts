/**
 * usePromotions Tests — Phase 61
 *
 * Verifies that usePromotions delegates to promotionsService.list(),
 * uses the correct queryKey, and returns sensible defaults.
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { usePromotions } from "../usePromotions";

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn((opts: any) => {
    opts.queryFn();
    return { data: null, isLoading: false, error: null, refetch: jest.fn() };
  }),
}));

jest.mock("@/services", () => ({
  promotionsService: {
    list: jest.fn().mockResolvedValue({
      promotedProducts: [],
      featuredProducts: [],
      activeCoupons: [],
    }),
  },
}));

const { useApiQuery } = require("@/hooks");
const { promotionsService } = require("@/services");

describe("usePromotions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls promotionsService.list with no arguments", () => {
    renderHook(() => usePromotions());
    expect(promotionsService.list).toHaveBeenCalledWith();
  });

  it("uses queryKey ['promotions']", () => {
    renderHook(() => usePromotions());
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["promotions"] }),
    );
  });

  it("returns empty arrays when data is null", () => {
    (useApiQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });
    const { result } = renderHook(() => usePromotions());
    expect(result.current.promotedProducts).toEqual([]);
    expect(result.current.featuredProducts).toEqual([]);
    expect(result.current.activeCoupons).toEqual([]);
    expect(result.current.isLoading).toBe(true);
  });

  it("returns data fields when data is available", () => {
    const mockData = {
      promotedProducts: [{ id: "p1" }],
      featuredProducts: [{ id: "p2" }],
      activeCoupons: [{ id: "c1", code: "SAVE10" }],
    };
    (useApiQuery as jest.Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    const { result } = renderHook(() => usePromotions());
    expect(result.current.promotedProducts).toEqual(mockData.promotedProducts);
    expect(result.current.featuredProducts).toEqual(mockData.featuredProducts);
    expect(result.current.activeCoupons).toEqual(mockData.activeCoupons);
  });

  it("exposes the raw data object", () => {
    const mockData = {
      promotedProducts: [],
      featuredProducts: [],
      activeCoupons: [],
    };
    (useApiQuery as jest.Mock).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    const { result } = renderHook(() => usePromotions());
    expect(result.current.data).toEqual(mockData);
  });

  it("exposes error from query", () => {
    const err = new Error("promotions unavailable");
    (useApiQuery as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: err,
      refetch: jest.fn(),
    });
    const { result } = renderHook(() => usePromotions());
    expect(result.current.error).toBe(err);
  });
});
