/**
 * useAddressSelector Tests — Phase 62
 *
 * Verifies that useAddressSelector bundles address list query + create mutation,
 * normalises data.data / data.items arrays, and forwards callbacks.
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useAddressSelector } from "../useAddressSelector";

const mockRefetch = jest.fn();

jest.mock("../useApiQuery", () => ({
  useApiQuery: jest.fn(() => ({
    data: null,
    isLoading: false,
    error: null,
    refetch: mockRefetch,
  })),
}));

jest.mock("../useApiMutation", () => ({
  useApiMutation: jest.fn((opts: any) => ({
    mutate: (data: any) => opts.mutationFn(data),
    isLoading: false,
    error: null,
    data: undefined,
    reset: jest.fn(),
  })),
}));

jest.mock("@/services", () => ({
  addressService: {
    list: jest.fn().mockResolvedValue({ data: [] }),
    create: jest
      .fn()
      .mockResolvedValue({ success: true, data: { id: "addr-1" } }),
  },
}));

const { useApiQuery } = require("../useApiQuery");
const { useApiMutation } = require("../useApiMutation");
const { addressService } = require("@/services");

describe("useAddressSelector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useApiQuery as jest.Mock).mockImplementation((opts: any) => {
      opts.queryFn();
      return {
        data: null,
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      };
    });
  });

  it("queries addressService.list with queryKey ['user-addresses']", () => {
    renderHook(() => useAddressSelector());
    expect(useApiQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["user-addresses"] }),
    );
    expect(addressService.list).toHaveBeenCalled();
  });

  it("returns empty addresses array when data is null", () => {
    const { result } = renderHook(() => useAddressSelector());
    expect(result.current.addresses).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("normalises data.data array", () => {
    const addrs = [{ id: "a1", label: "Home", city: "Delhi" }];
    (useApiQuery as jest.Mock).mockReturnValue({
      data: { data: addrs },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });
    const { result } = renderHook(() => useAddressSelector());
    expect(result.current.addresses).toEqual(addrs);
  });

  it("normalises data.items array as fallback", () => {
    const addrs = [{ id: "a2", label: "Office", city: "Mumbai" }];
    (useApiQuery as jest.Mock).mockReturnValue({
      data: { items: addrs },
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });
    const { result } = renderHook(() => useAddressSelector());
    expect(result.current.addresses).toEqual(addrs);
  });

  it("calls addressService.create when createAddress is invoked", () => {
    const { result } = renderHook(() => useAddressSelector());
    const payload = {
      fullName: "Alice",
      phone: "9876543210",
      line1: "123 Main St",
      city: "Delhi",
      state: "DL",
      pincode: "110001",
      country: "IN",
    };
    result.current.createAddress(payload);
    expect(addressService.create).toHaveBeenCalledWith(payload);
  });

  it("exposes refetch function", () => {
    const { result } = renderHook(() => useAddressSelector());
    expect(result.current.refetch).toBe(mockRefetch);
  });
});
