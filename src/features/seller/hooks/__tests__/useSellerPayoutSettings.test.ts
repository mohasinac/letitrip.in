import { renderHook } from "@testing-library/react";
import { useSellerPayoutSettings } from "../useSellerPayoutSettings";

jest.mock("@/hooks", () => ({
  useApiQuery: jest.fn(() => ({
    data: undefined, isLoading: false, error: null, refetch: jest.fn(),
  })),
  useApiMutation: jest.fn(() => ({
    mutate: jest.fn(), isLoading: false,
  })),
  useMessage: jest.fn(() => ({ showSuccess: jest.fn(), showError: jest.fn() })),
}));

jest.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock("@/services", () => ({
  sellerService: {
    getPayoutSettings: jest.fn(),
    updatePayoutSettings: jest.fn(),
  },
}));

describe("useSellerPayoutSettings", () => {
  it("returns default state when no data", () => {
    const { result } = renderHook(() => useSellerPayoutSettings());
    expect(result.current.payoutDetails).toBeUndefined();
    expect(result.current.isConfigured).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it("exposes updatePayoutSettings function", () => {
    const { result } = renderHook(() => useSellerPayoutSettings());
    expect(typeof result.current.updatePayoutSettings).toBe("function");
  });

  it("exposes refetch function", () => {
    const { result } = renderHook(() => useSellerPayoutSettings());
    expect(typeof result.current.refetch).toBe("function");
  });
});
