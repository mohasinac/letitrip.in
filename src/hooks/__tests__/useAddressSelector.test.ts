/**
 * useAddressSelector Tests — Phase 62
 *
 * Verifies that useAddressSelector bundles address list query + create mutation,
 * reads unwrapped array data from apiClient, and forwards callbacks.
 */

/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useAddressSelector } from "../useAddressSelector";

const mockRefetch = jest.fn();
const mockMutate = jest.fn();

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(() => ({
    data: undefined,
    isLoading: false,
    refetch: mockRefetch,
  })),
  useMutation: jest.fn((opts: any) => {
    mockMutate.mockImplementation((vars: any) => opts.mutationFn(vars));
    return {
      mutate: mockMutate,
      isPending: false,
    };
  }),
}));

jest.mock("@/services", () => ({
  addressService: {
    list: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock("@/actions", () => ({
  createAddressAction: jest.fn().mockResolvedValue({ id: "addr-1" }),
}));

const { useQuery, useMutation } = require("@tanstack/react-query");
const { addressService } = require("@/services");
const { createAddressAction } = require("@/actions");

describe("useAddressSelector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useQuery as jest.Mock).mockImplementation((opts: any) => {
      opts.queryFn();
      return {
        data: undefined,
        isLoading: false,
        refetch: mockRefetch,
      };
    });
  });

  it("queries addressService.list with queryKey ['user-addresses']", () => {
    renderHook(() => useAddressSelector());
    expect(useQuery).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: ["user-addresses"] }),
    );
    expect(addressService.list).toHaveBeenCalled();
  });

  it("returns empty addresses array when data is undefined", () => {
    const { result } = renderHook(() => useAddressSelector());
    expect(result.current.addresses).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it("returns address list when query returns an array", () => {
    const addrs = [{ id: "a1", label: "Home", city: "Delhi" }];
    (useQuery as jest.Mock).mockReturnValue({
      data: addrs,
      isLoading: false,
      refetch: mockRefetch,
    });
    const { result } = renderHook(() => useAddressSelector());
    expect(result.current.addresses).toEqual(addrs);
  });

  it("calls createAddressAction when createAddress is invoked", async () => {
    const { result } = renderHook(() => useAddressSelector());
    const payload = {
      label: "Home",
      fullName: "Alice",
      phone: "9876543210",
      addressLine1: "123 Main St",
      city: "Delhi",
      state: "DL",
      postalCode: "110001",
      country: "IN",
    };
    await result.current.createAddress(payload);
    expect(useMutation).toHaveBeenCalled();
    expect(createAddressAction).toHaveBeenCalledWith({
      ...payload,
      isDefault: false,
    });
  });

  it("exposes refetch function", () => {
    const { result } = renderHook(() => useAddressSelector());
    expect(result.current.refetch).toBe(mockRefetch);
  });
});
