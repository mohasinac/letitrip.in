/**
 * Tests for useProfile and useUpdateProfile hooks
 * Phase 18.4 — Address + Profile Hooks
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { useProfile, useUpdateProfile } from "../useProfile";
import { cacheManager } from "@/classes";

// ─── Mock @/lib/api-client ────────────────────────────────────────────────────
// useProfile imports both apiClient and API_ENDPOINTS from @/lib/api-client.
// Preserve ApiClientError + API_ENDPOINTS via jest.requireActual, replace only apiClient.
const mockGet = jest.fn();
const mockPatch = jest.fn();

jest.mock("@/lib/api-client", () => ({
  ...jest.requireActual("@/lib/api-client"),
  apiClient: {
    get: (...args: unknown[]) => mockGet(...args),
    post: jest.fn(),
    patch: (...args: unknown[]) => mockPatch(...args),
    delete: jest.fn(),
  },
}));

// ─── Sample data ──────────────────────────────────────────────────────────────
const MOCK_PROFILE = {
  uid: "user-1",
  email: "alice@example.com",
  phoneNumber: "+919876543210",
  displayName: "Alice Smith",
  photoURL: null,
  role: "user",
  emailVerified: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-06-01"),
};

beforeEach(() => {
  jest.clearAllMocks();
  cacheManager.clear();
});

// ─── Suite: useProfile ────────────────────────────────────────────────────────
describe("useProfile", () => {
  it("fetches profile data from /api/user/profile on mount", async () => {
    mockGet.mockResolvedValueOnce(MOCK_PROFILE);

    const { result } = renderHook(() => useProfile());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(MOCK_PROFILE);
  });

  it("returns error state when fetch returns a rejected promise", async () => {
    mockGet.mockRejectedValueOnce(new Error("fetch failed"));

    const { result } = renderHook(() => useProfile());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeUndefined();
  });

  it("does not fetch when enabled=false", () => {
    const { result } = renderHook(() => useProfile({ enabled: false }));

    // Should not call the underlying get even though isLoading may start as true
    expect(mockGet).not.toHaveBeenCalled();
    // No data in state
    expect(result.current.data).toBeUndefined();
  });

  it("calls onSuccess callback with the fetched profile data", async () => {
    mockGet.mockResolvedValueOnce(MOCK_PROFILE);
    const onSuccess = jest.fn();

    const { result } = renderHook(() => useProfile({ onSuccess }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(onSuccess).toHaveBeenCalledWith(MOCK_PROFILE);
  });

  it("calls onError callback when fetch rejects", async () => {
    mockGet.mockRejectedValueOnce(new Error("server error"));
    const onError = jest.fn();

    const { result } = renderHook(() => useProfile({ onError }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(onError).toHaveBeenCalled();
  });
});

// ─── Suite: useUpdateProfile ──────────────────────────────────────────────────
describe("useUpdateProfile", () => {
  it("calls PATCH to /api/user/profile with provided update data", async () => {
    const updatedProfile = { ...MOCK_PROFILE, displayName: "Alice Updated" };
    mockPatch.mockResolvedValueOnce(updatedProfile);
    const onSuccess = jest.fn();

    const { result } = renderHook(() => useUpdateProfile({ onSuccess }));

    await act(async () => {
      await result.current.mutate({ displayName: "Alice Updated" });
    });

    expect(mockPatch).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith(updatedProfile, expect.anything());
  });

  it("exposes error state when PATCH returns a rejected promise", async () => {
    mockPatch.mockRejectedValueOnce(new Error("update failed"));
    const onError = jest.fn();

    const { result } = renderHook(() => useUpdateProfile({ onError }));

    await act(async () => {
      try {
        await result.current.mutate({ displayName: "Bad Update" });
      } catch {
        // mutation re-throws; captured by hook state
      }
    });

    expect(onError).toHaveBeenCalled();
    expect(result.current.error).toBeTruthy();
  });

  it("starts in idle state with no error and no data", () => {
    const { result } = renderHook(() => useUpdateProfile());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeUndefined();
  });

  it("sets isLoading=true while mutation is in-flight", async () => {
    let resolveMutation!: (v: unknown) => void;
    mockPatch.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveMutation = resolve;
      }),
    );

    const { result } = renderHook(() => useUpdateProfile());

    // Kick off the mutation without awaiting
    act(() => {
      void result.current.mutate({ displayName: "Inflight" });
    });

    expect(result.current.isLoading).toBe(true);

    // Let it finish
    await act(async () => {
      resolveMutation({ ...MOCK_PROFILE, displayName: "Inflight" });
      await Promise.resolve();
    });

    expect(result.current.isLoading).toBe(false);
  });
});
