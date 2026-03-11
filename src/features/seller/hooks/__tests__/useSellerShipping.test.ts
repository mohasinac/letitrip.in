import { renderHook, act } from "@testing-library/react";
import { useSellerShipping } from "../useSellerShipping";

jest.mock("@/hooks", () => ({
  ...jest.requireActual("@/hooks"),
  ...jest.requireActual("@/hooks"),
  useApiQuery: jest.fn(({ queryFn, onError }) => {
    return {
      data: undefined,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    };
  }),
  useApiMutation: jest.fn(({ onSuccess, onError } = {}) => ({
    mutate: jest.fn(),
    isLoading: false,
  })),
  useMessage: jest.fn(() => ({ showSuccess: jest.fn(), showError: jest.fn() })),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/services", () => ({
  sellerService: {
    getShipping: jest.fn(),
    updateShipping: jest.fn(),
    verifyPickupOtp: jest.fn(),
  },
}));

describe("useSellerShipping", () => {
  it("returns default state when no data", () => {
    const { result } = renderHook(() => useSellerShipping());
    expect(result.current.shippingConfig).toBeUndefined();
    expect(result.current.isConfigured).toBe(false);
    expect(result.current.isTokenValid).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("exposes updateShipping and verifyOtp functions", () => {
    const { result } = renderHook(() => useSellerShipping());
    expect(typeof result.current.updateShipping).toBe("function");
    expect(typeof result.current.verifyOtp).toBe("function");
  });

  it("exposes refetch function", () => {
    const { result } = renderHook(() => useSellerShipping());
    expect(typeof result.current.refetch).toBe("function");
  });
});
