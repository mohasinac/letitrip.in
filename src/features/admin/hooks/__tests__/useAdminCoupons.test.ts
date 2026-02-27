/**
 * useAdminCoupons Tests — Phase 63
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useAdminCoupons } from "../useAdminCoupons";

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn((opts: any) => {
    opts.queryFn();
    return { data: null, isLoading: false, error: null, refetch: jest.fn() };
  }),
  useApiMutation: jest.fn((opts: any) => ({
    mutate: (data: unknown) => opts.mutationFn(data),
    isPending: false,
    error: null,
  })),
}));

jest.mock("@/services", () => ({
  couponService: {
    list: jest.fn().mockResolvedValue({ coupons: [], meta: {} }),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue({}),
    delete: jest.fn().mockResolvedValue({}),
  },
}));

const { useApiQuery, useApiMutation } = require("@/hooks");
const { couponService } = require("@/services");

describe("useAdminCoupons", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useApiQuery as jest.Mock).mockImplementation((opts: any) => {
      opts.queryFn();
      return { data: null, isLoading: false };
    });
    (useApiMutation as jest.Mock).mockImplementation((opts: any) => ({
      mutate: (data: unknown) => opts.mutationFn(data),
      isPending: false,
    }));
  });

  it("calls couponService.list with sieveParams", () => {
    renderHook(() => useAdminCoupons("page=1"));
    expect(couponService.list).toHaveBeenCalledWith("page=1");
  });

  it("uses queryKey ['admin', 'coupons', sieveParams]", () => {
    renderHook(() => useAdminCoupons("page=1"));
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["admin", "coupons", "page=1"] }),
    );
  });

  it("createMutation calls couponService.create", () => {
    const { result } = renderHook(() => useAdminCoupons(""));
    result.current.createMutation.mutate({ code: "SAVE10" });
    expect(couponService.create).toHaveBeenCalledWith({ code: "SAVE10" });
  });

  it("deleteMutation calls couponService.delete with id", () => {
    const { result } = renderHook(() => useAdminCoupons(""));
    result.current.deleteMutation.mutate("coup-1");
    expect(couponService.delete).toHaveBeenCalledWith("coup-1");
  });
});
