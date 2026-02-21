/**
 * Tests for useAddresses hooks
 * Phase 18.4 — Address + Profile Hooks
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from "../useAddresses";
import { cacheManager } from "@/classes";

// ─── Mock @/lib/api-client ────────────────────────────────────────────────────
// Preserve ApiClientError (used internally by useApiMutation) via jest.requireActual,
// then replace only the apiClient methods with controllable jest.fn() mocks.
const mockGet = jest.fn();
const mockPost = jest.fn();
const mockPatch = jest.fn();
const mockDelete = jest.fn();

jest.mock("@/lib/api-client", () => ({
  ...jest.requireActual("@/lib/api-client"),
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    patch: (...args: unknown[]) => mockPatch(...args),
    delete: (...args: unknown[]) => mockDelete(...args),
  },
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

beforeEach(() => {
  jest.clearAllMocks();
  cacheManager.clear();
});

// ─── Suite: useAddresses ──────────────────────────────────────────────────────
describe("useAddresses", () => {
  it("fetches address list on mount and returns data", async () => {
    mockGet.mockResolvedValueOnce(MOCK_ADDRESSES);

    const { result } = renderHook(() => useAddresses());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGet).toHaveBeenCalled();
    expect(result.current.data).toEqual(MOCK_ADDRESSES);
  });

  it("exposes error when fetch fails", async () => {
    const err = new Error("Network error");
    mockGet.mockRejectedValueOnce(err);

    const { result } = renderHook(() => useAddresses());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeUndefined();
  });

  it("does not fetch when enabled=false", () => {
    const { result } = renderHook(() => useAddresses({ enabled: false }));

    // Should not call the underlying get even though isLoading may start as true
    expect(mockGet).not.toHaveBeenCalled();
    // No data in state
    expect(result.current.data).toBeUndefined();
  });

  it("calls onSuccess callback with response data", async () => {
    mockGet.mockResolvedValueOnce(MOCK_ADDRESSES);
    const onSuccess = jest.fn();

    const { result } = renderHook(() => useAddresses({ onSuccess }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(onSuccess).toHaveBeenCalledWith(MOCK_ADDRESSES);
  });
});

// ─── Suite: useCreateAddress ──────────────────────────────────────────────────
describe("useCreateAddress", () => {
  it("calls POST to addresses endpoint with form data", async () => {
    mockPost.mockResolvedValueOnce(MOCK_NEW_ADDRESS);
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

    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith(MOCK_NEW_ADDRESS, expect.anything());
  });

  it("exposes error when POST fails", async () => {
    mockPost.mockRejectedValueOnce(new Error("creation failed"));
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
        // mutation re-throws; captured by hook state
      }
    });

    expect(onError).toHaveBeenCalled();
    expect(result.current.error).toBeTruthy();
  });
});

// ─── Suite: useUpdateAddress ──────────────────────────────────────────────────
describe("useUpdateAddress", () => {
  it("calls PATCH to the address endpoint with updated data", async () => {
    const updated = { ...MOCK_ADDRESSES[0], city: "Delhi" };
    mockPatch.mockResolvedValueOnce(updated);
    const onSuccess = jest.fn();

    const { result } = renderHook(() =>
      useUpdateAddress("addr-1", { onSuccess }),
    );

    await act(async () => {
      await result.current.mutate({ ...MOCK_ADDRESSES[0], city: "Delhi" });
    });

    expect(mockPatch).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith(updated, expect.anything());
  });

  it("exposes error when PATCH fails", async () => {
    mockPatch.mockRejectedValueOnce(new Error("update failed"));

    const { result } = renderHook(() => useUpdateAddress("addr-1"));

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
        // mutation re-throws; captured by hook state
      }
    });

    expect(result.current.error).toBeTruthy();
  });
});

// ─── Suite: useDeleteAddress ──────────────────────────────────────────────────
describe("useDeleteAddress", () => {
  it("calls DELETE to the address endpoint for the given id", async () => {
    mockDelete.mockResolvedValueOnce({ success: true });
    const onSuccess = jest.fn();

    const { result } = renderHook(() => useDeleteAddress({ onSuccess }));

    await act(async () => {
      await result.current.mutate({ id: "addr-1" });
    });

    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
    );
  });

  it("exposes error when DELETE fails", async () => {
    mockDelete.mockRejectedValueOnce(new Error("deletion failed"));

    const { result } = renderHook(() => useDeleteAddress());

    await act(async () => {
      try {
        await result.current.mutate({ id: "addr-1" });
      } catch {
        // mutation re-throws; captured by hook state
      }
    });

    expect(result.current.error).toBeTruthy();
  });
});

// ─── Suite: useSetDefaultAddress ─────────────────────────────────────────────
describe("useSetDefaultAddress", () => {
  it("calls POST to the set-default endpoint for the given address", async () => {
    mockPost.mockResolvedValueOnce({ success: true });
    const onSuccess = jest.fn();

    const { result } = renderHook(() => useSetDefaultAddress({ onSuccess }));

    await act(async () => {
      await result.current.mutate({ addressId: "addr-2" });
    });

    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
    );
  });

  it("exposes error when set-default POST fails", async () => {
    mockPost.mockRejectedValueOnce(new Error("set-default failed"));

    const { result } = renderHook(() => useSetDefaultAddress());

    await act(async () => {
      try {
        await result.current.mutate({ addressId: "addr-2" });
      } catch {
        // mutation re-throws; captured by hook state
      }
    });

    expect(result.current.error).toBeTruthy();
  });
});
