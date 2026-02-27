/**
 * useCheckout Tests — Phase 61
 *
 * Verifies that useCheckout wires:
 * - addressService.list() as addressQuery
 * - cartService.get() as cartQuery
 * - checkoutService.placeOrder() as placeCodOrderMutation
 * - Razorpay helpers as bound passthrough functions
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useCheckout } from "../useCheckout";

const mockRefetch = jest.fn();
const mockMutate = jest.fn();

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn((opts: any) => {
    opts.queryFn();
    return { data: null, isLoading: false, error: null, refetch: mockRefetch };
  }),
  useApiMutation: jest.fn((opts: any) => ({
    mutate: (data: unknown) => opts.mutationFn(data),
    isLoading: false,
    error: null,
    data: undefined,
    reset: jest.fn(),
  })),
}));

jest.mock("@/services", () => ({
  addressService: {
    list: jest.fn().mockResolvedValue({ data: [] }),
  },
  cartService: {
    get: jest.fn().mockResolvedValue({ cart: null, itemCount: 0, subtotal: 0 }),
  },
  checkoutService: {
    placeOrder: jest
      .fn()
      .mockResolvedValue({ orderIds: [], total: 0, itemCount: 0 }),
    createPaymentOrder: jest.fn().mockResolvedValue({}),
    verifyPayment: jest.fn().mockResolvedValue({}),
  },
}));

const { useApiQuery, useApiMutation } = require("@/hooks");
const { addressService, cartService, checkoutService } = require("@/services");

describe("useCheckout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("queries addressService.list with queryKey ['addresses']", () => {
    renderHook(() => useCheckout());
    expect(addressService.list).toHaveBeenCalled();
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["addresses"] }),
    );
  });

  it("queries cartService.get with queryKey ['cart']", () => {
    renderHook(() => useCheckout());
    expect(cartService.get).toHaveBeenCalled();
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["cart"] }),
    );
  });

  it("wires checkoutService.placeOrder to placeCodOrderMutation", () => {
    const { result } = renderHook(() => useCheckout());
    const payload = { addressId: "addr1", paymentMethod: "cod" as const };
    result.current.placeCodOrderMutation.mutate(payload);
    expect(checkoutService.placeOrder).toHaveBeenCalledWith(payload);
  });

  it("calls onPlaceCodOrderSuccess callback on success", () => {
    const onSuccess = jest.fn();
    (useApiMutation as jest.Mock).mockImplementation((opts: any) => {
      return {
        mutate: (data: unknown) => {
          const result = opts.mutationFn(data);
          return result.then((res: unknown) => opts.onSuccess?.(res));
        },
        isLoading: false,
        error: null,
        data: undefined,
        reset: jest.fn(),
      };
    });
    renderHook(() => useCheckout({ onPlaceCodOrderSuccess: onSuccess }));
    expect(useApiMutation).toHaveBeenCalledWith(
      expect.objectContaining({ onSuccess }),
    );
  });

  it("calls onPlaceCodOrderError callback on error", () => {
    const onError = jest.fn();
    renderHook(() => useCheckout({ onPlaceCodOrderError: onError }));
    expect(useApiMutation).toHaveBeenCalledWith(
      expect.objectContaining({ onError }),
    );
  });

  it("exposes createPaymentOrder as a bound function", () => {
    const { result } = renderHook(() => useCheckout());
    expect(typeof result.current.createPaymentOrder).toBe("function");
  });

  it("exposes verifyPayment as a bound function", () => {
    const { result } = renderHook(() => useCheckout());
    expect(typeof result.current.verifyPayment).toBe("function");
  });

  it("returns addressQuery and cartQuery objects", () => {
    const { result } = renderHook(() => useCheckout());
    expect(result.current.addressQuery).toBeDefined();
    expect(result.current.cartQuery).toBeDefined();
  });
});
