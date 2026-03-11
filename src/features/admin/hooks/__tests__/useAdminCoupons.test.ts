/**
 * useAdminCoupons Tests — Phase 63
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useAdminCoupons } from "../useAdminCoupons";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn((opts: any) => {
    opts.queryFn();
    return { data: null, isLoading: false, error: null, refetch: jest.fn() };
  }),
  useMutation: jest.fn((opts: any) => ({
    mutate: (data: unknown) => opts.mutationFn(data),
    isPending: false,
    error: null,
  })),
  useQueryClient: jest.fn(() => ({ invalidateQueries: jest.fn() })),
}));

jest.mock("@/services", () => ({
  couponService: {
    list: jest.fn().mockResolvedValue({ coupons: [], meta: {} }),
  },
}));

jest.mock("@/actions", () => ({
  adminCreateCouponAction: jest.fn().mockResolvedValue({}),
  adminUpdateCouponAction: jest.fn().mockResolvedValue({}),
  adminDeleteCouponAction: jest.fn().mockResolvedValue({}),
}));

const { useQuery } = require("@tanstack/react-query");
const { couponService } = require("@/services");
const {
  adminCreateCouponAction,
  adminDeleteCouponAction,
} = require("@/actions");

describe("useAdminCoupons", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useQuery as jest.Mock).mockImplementation((opts: any) => {
      opts.queryFn();
      return { data: null, isLoading: false };
    });
  });

  it("calls couponService.list with sieveParams", () => {
    renderHook(() => useAdminCoupons("page=1"));
    expect(couponService.list).toHaveBeenCalledWith("page=1");
  });

  it("uses queryKey ['admin', 'coupons', sieveParams]", () => {
    renderHook(() => useAdminCoupons("page=1"));
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["admin", "coupons", "page=1"] }),
    );
  });

  it("createMutation calls adminCreateCouponAction", () => {
    const { result } = renderHook(() => useAdminCoupons(""));
    result.current.createMutation.mutate({ code: "SAVE10" });
    expect(adminCreateCouponAction).toHaveBeenCalledWith({ code: "SAVE10" });
  });

  it("deleteMutation calls adminDeleteCouponAction with id", () => {
    const { result } = renderHook(() => useAdminCoupons(""));
    result.current.deleteMutation.mutate("coup-1");
    expect(adminDeleteCouponAction).toHaveBeenCalledWith("coup-1");
  });
});
