/**
 * useCouponValidate Tests — Phase 61
 *
 * Verifies that useCouponValidate delegates to couponService.validate()
 * and wires the mutation correctly.
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useCouponValidate } from "../useCouponValidate";

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  ...jest.requireActual("@/hooks"),
  useApiMutation: jest.fn((opts: any) => ({
    mutate: (payload: unknown) => opts.mutationFn(payload),
    isLoading: false,
    error: null,
    data: undefined,
    reset: jest.fn(),
  })),
}));

jest.mock("@/services", () => ({
  couponService: {
    validate: jest.fn().mockResolvedValue({ valid: true, discount: 10 }),
  },
}));

const { useApiMutation } = require("@/hooks");
const { couponService } = require("@/services");

describe("useCouponValidate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("calls couponService.validate with the given payload", () => {
    const { result } = renderHook(() => useCouponValidate());
    const payload = { code: "SAVE10", orderTotal: 500 };
    result.current.mutate(payload);
    expect(couponService.validate).toHaveBeenCalledWith(payload);
  });

  it("calls couponService.validate with code only (no orderTotal)", () => {
    const { result } = renderHook(() => useCouponValidate());
    result.current.mutate({ code: "FREE" });
    expect(couponService.validate).toHaveBeenCalledWith({ code: "FREE" });
  });

  it("wires mutationFn through useApiMutation", () => {
    renderHook(() => useCouponValidate());
    expect(useApiMutation).toHaveBeenCalledWith(
      expect.objectContaining({ mutationFn: expect.any(Function) }),
    );
  });

  it("returns mutation state from useApiMutation", () => {
    (useApiMutation as jest.Mock).mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
      error: new Error("invalid coupon"),
      data: undefined,
      reset: jest.fn(),
    });
    const { result } = renderHook(() => useCouponValidate());
    expect(result.current.error?.message).toBe("invalid coupon");
  });
});
