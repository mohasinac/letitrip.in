/**
 * Tests for useAddresses hooks
 * Phase 18.4 — Address + Profile Hooks
 */

import { renderHook, act } from "@testing-library/react";
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from "../useAddresses";
import { cacheManager } from "@mohasinac/appkit/core";

// ─── Mock @tanstack/react-query ───────────────────────────────────────────────
jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn((opts: any) => {
    if (opts.enabled === false) {
      return {
        data: undefined,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      };
    }
    opts.queryFn?.();
    return {
      data: undefined,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    };
  }),
  useMutation: jest.fn((opts: any) => ({
    mutate: async (data: unknown) => {
      try {
        const result = await opts.mutationFn(data);
        await opts.onSuccess?.(result, data, undefined);
        return result;
      } catch (e) {
        await opts.onError?.(e, data, undefined);
        throw e;
      }
    },
    mutateAsync: async (data: unknown) => {
      const result = await opts.mutationFn(data);
      await opts.onSuccess?.(result, data, undefined);
      return result;
    },
    isPending: false,
    error: null,
  })),
  useQueryClient: jest.fn(() => ({ invalidateQueries: jest.fn() })),
}));

// ─── Mock @/services ──────────────────────────────────────────────────────────
const mockAddressList = jest.fn().mockResolvedValue([]);
jest.mock("@/services", () => ({
  addressService: {
    list: (...args: any[]) => mockAddressList(...args),
    getById: jest.fn().mockResolvedValue(undefined),
  },
}));

// ─── Mock @/actions ───────────────────────────────────────────────────────────
const mockCreateAddressAction = jest.fn().mockResolvedValue(undefined);
const mockUpdateAddressAction = jest.fn().mockResolvedValue(undefined);
const mockDeleteAddressAction = jest.fn().mockResolvedValue(undefined);
const mockSetDefaultAddressAction = jest.fn().mockResolvedValue(undefined);
jest.mock("@/actions", () => ({
  ...jest.requireActual("@/actions"),
  createAddressAction: (...args: any[]) => mockCreateAddressAction(...args),
  updateAddressAction: (...args: any[]) => mockUpdateAddressAction(...args),
  deleteAddressAction: (...args: any[]) => mockDeleteAddressAction(...args),
  setDefaultAddressAction: (...args: any[]) =>
    mockSetDefaultAddressAction(...args),
}));

// ─── Sample data ──────────────────────────────────────────────────────────────
const MOCK_ADDRESSES = [
  {
    id: "addr-1",
    label: "Home",
    fullName: "Alice",
    phone: "9999999999",
    addressLine1: "123 Main St",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400001",
    country: "India",
    isDefault: true,
  },
  {
    id: "addr-2",
    label: "Office",
    fullName: "Alice",
    phone: "9999999999",
    addressLine1: "456 Work Rd",
    city: "Pune",
    state: "Maharashtra",
    postalCode: "411001",
    country: "India",
    isDefault: false,
  },
];

const MOCK_NEW_ADDRESS = {
  id: "addr-3",
  label: "Holiday",
  fullName: "Alice",
  phone: "9999999999",
  addressLine1: "789 Beach Ave",
  city: "Goa",
  state: "Goa",
  postalCode: "403001",
  country: "India",
  isDefault: false,
};

const {
  useQuery,
  useMutation,
  useQueryClient,
} = require("@tanstack/react-query");

beforeEach(() => {
  jest.clearAllMocks();
  cacheManager.clear();
  (useQuery as jest.Mock).mockImplementation((opts: any) => {
    if (opts.enabled === false) {
      return {
        data: undefined,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      };
    }
    opts.queryFn?.();
    return {
      data: undefined,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    };
  });
  (useMutation as jest.Mock).mockImplementation((opts: any) => ({
    mutate: async (data: unknown) => {
      try {
        const result = await opts.mutationFn(data);
        await opts.onSuccess?.(result, data, undefined);
        return result;
      } catch (e) {
        await opts.onError?.(e, data, undefined);
        throw e;
      }
    },
    mutateAsync: async (data: unknown) => {
      const result = await opts.mutationFn(data);
      await opts.onSuccess?.(result, data, undefined);
      return result;
    },
    isPending: false,
    error: null,
  }));
  (useQueryClient as jest.Mock).mockReturnValue({
    invalidateQueries: jest.fn(),
  });
});

// ─── Suite: useAddresses ──────────────────────────────────────────────────────
describe("useAddresses", () => {
  it("calls addressService.list on mount", () => {
    renderHook(() => useAddresses());
    expect(mockAddressList).toHaveBeenCalled();
  });

  it("returns data from the query", () => {
    (useQuery as jest.Mock).mockReturnValueOnce({
      data: MOCK_ADDRESSES,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    const { result } = renderHook(() => useAddresses());
    expect(result.current.data).toEqual(MOCK_ADDRESSES);
  });

  it("exposes error when fetch fails", () => {
    const err = new Error("Network error");
    (useQuery as jest.Mock).mockReturnValueOnce({
      data: undefined,
      isLoading: false,
      error: err,
      refetch: jest.fn(),
    });
    const { result } = renderHook(() => useAddresses());
    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeUndefined();
  });

  it("does not fetch when enabled=false", () => {
    const { result } = renderHook(() => useAddresses({ enabled: false }));
    expect(mockAddressList).not.toHaveBeenCalled();
    expect(result.current.data).toBeUndefined();
  });
});

// ─── Suite: useCreateAddress ──────────────────────────────────────────────────
describe("useCreateAddress", () => {
  it("calls createAddressAction with form data", async () => {
    mockCreateAddressAction.mockResolvedValueOnce(MOCK_NEW_ADDRESS);
    const onSuccess = jest.fn();

    const { result } = renderHook(() => useCreateAddress({ onSuccess }));

    await act(async () => {
      await result.current.mutate({
        label: "Holiday",
        fullName: "Alice",
        phone: "9999999999",
        addressLine1: "789 Beach Ave",
        city: "Goa",
        state: "Goa",
        postalCode: "403001",
        country: "India",
      });
    });

    expect(mockCreateAddressAction).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith(MOCK_NEW_ADDRESS);
  });

  it("calls onError when action fails", async () => {
    mockCreateAddressAction.mockRejectedValueOnce(new Error("creation failed"));
    const onError = jest.fn();

    const { result } = renderHook(() => useCreateAddress({ onError }));

    await act(async () => {
      try {
        await result.current.mutate({
          label: "X",
          fullName: "Alice",
          phone: "9999999999",
          addressLine1: "Addr",
          city: "City",
          state: "State",
          postalCode: "123456",
          country: "India",
        });
      } catch {
        // mutation re-throws; captured by onError
      }
    });

    expect(onError).toHaveBeenCalled();
  });
});

// ─── Suite: useUpdateAddress ──────────────────────────────────────────────────
describe("useUpdateAddress", () => {
  it("calls updateAddressAction with updated data", async () => {
    const updated = { ...MOCK_ADDRESSES[0], city: "Delhi" };
    mockUpdateAddressAction.mockResolvedValueOnce(updated);
    const onSuccess = jest.fn();

    const { result } = renderHook(() =>
      useUpdateAddress("addr-1", { onSuccess }),
    );

    await act(async () => {
      await result.current.mutate({ ...MOCK_ADDRESSES[0], city: "Delhi" });
    });

    expect(mockUpdateAddressAction).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith(updated);
  });

  it("calls onError when update fails", async () => {
    mockUpdateAddressAction.mockRejectedValueOnce(new Error("update failed"));
    const onError = jest.fn();

    const { result } = renderHook(() =>
      useUpdateAddress("addr-1", { onError }),
    );

    await act(async () => {
      try {
        await result.current.mutate({
          label: "Home",
          fullName: "Alice",
          phone: "9999999999",
          addressLine1: "New",
          city: "City",
          state: "State",
          postalCode: "123456",
          country: "India",
        });
      } catch {
        // mutation re-throws; captured by onError
      }
    });

    expect(onError).toHaveBeenCalled();
  });
});

// ─── Suite: useDeleteAddress ──────────────────────────────────────────────────
describe("useDeleteAddress", () => {
  it("calls deleteAddressAction for the given id", async () => {
    mockDeleteAddressAction.mockResolvedValueOnce({ success: true });
    const onSuccess = jest.fn();

    const { result } = renderHook(() => useDeleteAddress({ onSuccess }));

    await act(async () => {
      await result.current.mutate({ id: "addr-1" });
    });

    expect(mockDeleteAddressAction).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalled();
  });

  it("calls onError when delete fails", async () => {
    mockDeleteAddressAction.mockRejectedValueOnce(new Error("deletion failed"));
    const onError = jest.fn();

    const { result } = renderHook(() => useDeleteAddress({ onError }));

    await act(async () => {
      try {
        await result.current.mutate({ id: "addr-1" });
      } catch {
        // mutation re-throws; captured by onError
      }
    });

    expect(onError).toHaveBeenCalled();
  });
});

// ─── Suite: useSetDefaultAddress ─────────────────────────────────────────────
describe("useSetDefaultAddress", () => {
  it("calls setDefaultAddressAction for the given address", async () => {
    mockSetDefaultAddressAction.mockResolvedValueOnce({ success: true });
    const onSuccess = jest.fn();

    const { result } = renderHook(() => useSetDefaultAddress({ onSuccess }));

    await act(async () => {
      await result.current.mutate({ addressId: "addr-2" });
    });

    expect(mockSetDefaultAddressAction).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalled();
  });

  it("calls onError when set-default fails", async () => {
    mockSetDefaultAddressAction.mockRejectedValueOnce(
      new Error("set-default failed"),
    );
    const onError = jest.fn();

    const { result } = renderHook(() => useSetDefaultAddress({ onError }));

    await act(async () => {
      try {
        await result.current.mutate({ addressId: "addr-2" });
      } catch {
        // mutation re-throws; captured by onError
      }
    });

    expect(onError).toHaveBeenCalled();
  });
});
