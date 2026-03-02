/**
 * useSellerStore Tests
 *
 * Verifies that useSellerStore delegates to sellerService.getStore()
 * and exposes an updateStore mutation that calls sellerService.updateStore().
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useSellerStore } from "../useSellerStore";

const mockRefetch = jest.fn();

jest.mock("@/hooks", () => ({
  useAuth: jest.fn(() => ({
    user: { uid: "seller-1", email: "s@e.com" },
    loading: false,
  })),
  useApiQuery: jest.fn((opts: any) => {
    opts.queryFn();
    return {
      data: null,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    };
  }),
  useApiMutation: jest.fn((opts: any) => ({
    mutate: (data: any) => opts.mutationFn(data),
    isLoading: false,
  })),
}));

jest.mock("@/services", () => ({
  sellerService: {
    getStore: jest.fn().mockResolvedValue({
      storeSlug: "my-shop",
      publicProfile: { storeName: "My Shop" },
    }),
    updateStore: jest.fn().mockResolvedValue({ success: true }),
  },
}));

const { useApiQuery, useApiMutation } = require("@/hooks");
const { sellerService } = require("@/services");

describe("useSellerStore", () => {
  beforeEach(() => jest.clearAllMocks());

  it("calls sellerService.getStore() as the queryFn", () => {
    renderHook(() => useSellerStore());
    expect(sellerService.getStore).toHaveBeenCalled();
  });

  it("uses queryKey ['seller-store']", () => {
    renderHook(() => useSellerStore());
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["seller-store"] }),
    );
  });

  it("exposes updateStore mutation that calls sellerService.updateStore", () => {
    const { result } = renderHook(() => useSellerStore());
    const payload = { storeName: "Updated Name" };
    result.current.updateStore(payload);
    expect(sellerService.updateStore).toHaveBeenCalledWith(payload);
  });

  it("mutation onSuccess calls refetch", () => {
    renderHook(() => useSellerStore());
    const mutationOpts = (useApiMutation as jest.Mock).mock.calls[0][0];
    mutationOpts.onSuccess?.();
    expect(mockRefetch).toHaveBeenCalled();
  });

  it("returns isLoading and isSaving from hooks", () => {
    (useApiQuery as jest.Mock).mockReturnValueOnce({
      data: null,
      isLoading: true,
      error: null,
      refetch: mockRefetch,
    });
    (useApiMutation as jest.Mock).mockReturnValueOnce({
      mutate: jest.fn(),
      isLoading: false,
    });
    const { result } = renderHook(() => useSellerStore());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isSaving).toBe(false);
  });
});
