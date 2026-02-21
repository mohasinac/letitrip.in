/**
 * useApiQuery Tests — Phase 18.2
 *
 * Verifies data-fetching hook: loading states, success, error, refetch,
 * queryKey changes, enabled flag, and callbacks.
 *
 * Uses cacheTTL=0 on every test to bypass CacheManager and avoid
 * cross-test cache pollution.
 */

import { renderHook, waitFor, act } from "@testing-library/react";
import { useApiQuery } from "../useApiQuery";
import { ApiClientError } from "@/lib/api-client";

// Unique key per test to prevent in-flight request deduplication issues
let _testCount = 0;
const nextKey = (): string[] => [`__test_${++_testCount}__`];

// ============================================================
// Rendering / Loading States
// ============================================================
describe("useApiQuery", () => {
  describe("loading states", () => {
    it("returns isLoading=true and data=undefined before fetch resolves", () => {
      const queryFn = jest.fn(() => new Promise<string>(() => {})); // never resolves
      const { result } = renderHook(() =>
        useApiQuery({ queryKey: nextKey(), queryFn, cacheTTL: 0 }),
      );

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeNull();
    });

    it("returns data and isLoading=false after successful fetch", async () => {
      const queryFn = jest.fn().mockResolvedValue({ name: "Alice" });
      const { result } = renderHook(() =>
        useApiQuery({ queryKey: nextKey(), queryFn, cacheTTL: 0 }),
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.data).toEqual({ name: "Alice" });
      expect(result.current.error).toBeNull();
    });

    it("returns error and isLoading=false when fetch rejects", async () => {
      const queryFn = jest.fn().mockRejectedValue(new Error("Network error"));
      const { result } = renderHook(() =>
        useApiQuery({ queryKey: nextKey(), queryFn, cacheTTL: 0 }),
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).not.toBeNull();
      expect(result.current.error?.message).toBe("Network error");
    });

    it("preserves ApiClientError status when server responds with 4xx", async () => {
      const apiError = new ApiClientError("Not found", 404);
      const queryFn = jest.fn().mockRejectedValue(apiError);
      const { result } = renderHook(() =>
        useApiQuery({ queryKey: nextKey(), queryFn, cacheTTL: 0 }),
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.error).toBe(apiError);
      expect(result.current.error?.status).toBe(404);
    });
  });

  // ============================================================
  // Refetch
  // ============================================================
  describe("refetch", () => {
    it("refetch() triggers a new fetch call", async () => {
      const queryFn = jest.fn().mockResolvedValue("data");
      const { result } = renderHook(() =>
        useApiQuery({ queryKey: nextKey(), queryFn, cacheTTL: 0 }),
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      // Record how many times queryFn was called by initial mount (may be 1 or 2 in Strict Mode)
      const callsBeforeRefetch = queryFn.mock.calls.length;
      expect(callsBeforeRefetch).toBeGreaterThanOrEqual(1);

      await act(async () => {
        await result.current.refetch();
      });

      // After explicit refetch, exactly one more call should have happened
      expect(queryFn).toHaveBeenCalledTimes(callsBeforeRefetch + 1);
    });
  });

  // ============================================================
  // queryKey changes
  // ============================================================
  describe("queryKey changes", () => {
    it("changing queryKey triggers a new fetch", async () => {
      let key = "key-a-" + nextKey()[0];
      const queryFn = jest.fn().mockResolvedValue("data");
      const { result, rerender } = renderHook(() =>
        useApiQuery({ queryKey: [key], queryFn, cacheTTL: 0 }),
      );

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      const callsAfterFirstKey = queryFn.mock.calls.length;
      expect(callsAfterFirstKey).toBeGreaterThanOrEqual(1);

      key = "key-b-" + nextKey()[0]; // unique to avoid stale cache
      rerender();

      await waitFor(() =>
        expect(queryFn.mock.calls.length).toBeGreaterThan(callsAfterFirstKey),
      );
    });
  });

  // ============================================================
  // enabled flag
  // ============================================================
  describe("enabled flag", () => {
    it("does not call queryFn when enabled=false", async () => {
      const queryFn = jest.fn().mockResolvedValue("data");
      renderHook(() =>
        useApiQuery({
          queryKey: nextKey(),
          queryFn,
          enabled: false,
          cacheTTL: 0,
        }),
      );

      // Give React time to run any pending effects
      await new Promise<void>((resolve) => setTimeout(resolve, 50));
      expect(queryFn).not.toHaveBeenCalled();
    });

    it("starts fetching when enabled changes from false to true", async () => {
      let enabled = false;
      const queryFn = jest.fn().mockResolvedValue("data");
      const key = nextKey();
      const { rerender } = renderHook(() =>
        useApiQuery({ queryKey: key, queryFn, enabled, cacheTTL: 0 }),
      );

      expect(queryFn).not.toHaveBeenCalled();

      enabled = true;
      rerender();

      await waitFor(() =>
        expect(queryFn.mock.calls.length).toBeGreaterThanOrEqual(1),
      );
    });
  });

  // ============================================================
  // Callbacks
  // ============================================================
  describe("callbacks", () => {
    it("calls onSuccess callback with fetched data", async () => {
      const queryFn = jest.fn().mockResolvedValue({ id: 1 });
      const onSuccess = jest.fn();
      renderHook(() =>
        useApiQuery({ queryKey: nextKey(), queryFn, onSuccess, cacheTTL: 0 }),
      );

      await waitFor(() => expect(onSuccess).toHaveBeenCalledWith({ id: 1 }));
    });

    it("calls onError callback when fetch fails", async () => {
      const queryFn = jest.fn().mockRejectedValue(new Error("fetch failed"));
      const onError = jest.fn();
      renderHook(() =>
        useApiQuery({ queryKey: nextKey(), queryFn, onError, cacheTTL: 0 }),
      );

      await waitFor(() => expect(onError).toHaveBeenCalled());
      expect(onError.mock.calls[0][0].message).toBe("fetch failed");
    });
  });
});
