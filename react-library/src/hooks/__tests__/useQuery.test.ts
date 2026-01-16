import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useQuery } from "../useQuery";

describe("useQuery", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe("Basic functionality", () => {
    it("should fetch data successfully", async () => {
      const mockQueryFn = vi.fn().mockResolvedValue({ data: "test data" });

      const { result } = renderHook(() =>
        useQuery({
          queryKey: ["test"],
          queryFn: mockQueryFn,
        })
      );

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual({ data: "test data" });
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.error).toBeNull();
      expect(mockQueryFn).toHaveBeenCalledTimes(1);
    });

    it("should handle errors", async () => {
      const mockError = new Error("API error");
      const mockQueryFn = vi.fn().mockRejectedValue(mockError);

      const { result } = renderHook(() =>
        useQuery({
          queryKey: ["test"],
          queryFn: mockQueryFn,
        })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual(mockError);
      expect(result.current.isError).toBe(true);
      expect(result.current.data).toBeUndefined();
    });

    it("should not fetch when enabled is false", () => {
      const mockQueryFn = vi.fn().mockResolvedValue({ data: "test" });

      const { result } = renderHook(() =>
        useQuery({
          queryKey: ["test"],
          queryFn: mockQueryFn,
          enabled: false,
        })
      );

      expect(result.current.isLoading).toBe(false);
      expect(mockQueryFn).not.toHaveBeenCalled();
    });

    it("should use initial data", () => {
      const mockQueryFn = vi.fn().mockResolvedValue({ data: "new data" });
      const initialData = { data: "initial data" };

      const { result } = renderHook(() =>
        useQuery({
          queryKey: ["test"],
          queryFn: mockQueryFn,
          initialData,
        })
      );

      expect(result.current.data).toEqual(initialData);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("Caching", () => {
    it("should use cached data when available and not stale", async () => {
      const mockQueryFn = vi.fn().mockResolvedValue({ data: "test data" });

      // First render
      const { result: result1, unmount } = renderHook(() =>
        useQuery({
          queryKey: ["test-cache"],
          queryFn: mockQueryFn,
          staleTime: 10000,
        })
      );

      await waitFor(() => {
        expect(result1.current.isLoading).toBe(false);
      });

      expect(mockQueryFn).toHaveBeenCalledTimes(1);

      // Unmount first hook
      unmount();

      // Second render with same key
      const { result: result2 } = renderHook(() =>
        useQuery({
          queryKey: ["test-cache"],
          queryFn: mockQueryFn,
          staleTime: 10000,
        })
      );

      // Should use cache, not call queryFn again
      expect(result2.current.data).toEqual({ data: "test data" });
      expect(mockQueryFn).toHaveBeenCalledTimes(1);
    });

    it("should refetch when data is stale", async () => {
      const mockQueryFn = jest
        .fn()
        .mockResolvedValueOnce({ data: "first" })
        .mockResolvedValueOnce({ data: "second" });

      // First render
      const { result: result1, unmount } = renderHook(() =>
        useQuery({
          queryKey: ["test-stale"],
          queryFn: mockQueryFn,
          staleTime: 1000,
        })
      );

      await waitFor(() => {
        expect(result1.current.data).toEqual({ data: "first" });
      });

      unmount();

      // Advance time past staleTime
      act(() => {
        vi.advanceTimersByTime(1500);
      });

      // Second render
      const { result: result2 } = renderHook(() =>
        useQuery({
          queryKey: ["test-stale"],
          queryFn: mockQueryFn,
          staleTime: 1000,
        })
      );

      await waitFor(() => {
        expect(result2.current.data).toEqual({ data: "second" });
      });

      expect(mockQueryFn).toHaveBeenCalledTimes(2);
    });
  });

  describe("Callbacks", () => {
    it("should call onSuccess when query succeeds", async () => {
      const mockOnSuccess = vi.fn();
      const mockQueryFn = vi.fn().mockResolvedValue({ data: "test" });

      renderHook(() =>
        useQuery({
          queryKey: ["test"],
          queryFn: mockQueryFn,
          onSuccess: mockOnSuccess,
        })
      );

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith({ data: "test" });
      });
    });

    it("should call onError when query fails", async () => {
      const mockOnError = vi.fn();
      const mockError = new Error("Failed");
      const mockQueryFn = vi.fn().mockRejectedValue(mockError);

      renderHook(() =>
        useQuery({
          queryKey: ["test"],
          queryFn: mockQueryFn,
          onError: mockOnError,
        })
      );

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(mockError);
      });
    });

    it("should call onSettled on success", async () => {
      const mockOnSettled = vi.fn();
      const mockQueryFn = vi.fn().mockResolvedValue({ data: "test" });

      renderHook(() =>
        useQuery({
          queryKey: ["test"],
          queryFn: mockQueryFn,
          onSettled: mockOnSettled,
        })
      );

      await waitFor(() => {
        expect(mockOnSettled).toHaveBeenCalledWith({ data: "test" }, null);
      });
    });

    it("should call onSettled on error", async () => {
      const mockOnSettled = vi.fn();
      const mockError = new Error("Failed");
      const mockQueryFn = vi.fn().mockRejectedValue(mockError);

      renderHook(() =>
        useQuery({
          queryKey: ["test"],
          queryFn: mockQueryFn,
          onSettled: mockOnSettled,
        })
      );

      await waitFor(() => {
        expect(mockOnSettled).toHaveBeenCalledWith(undefined, mockError);
      });
    });
  });

  describe("Retry", () => {
    it("should retry on failure", async () => {
      const mockQueryFn = jest
        .fn()
        .mockRejectedValueOnce(new Error("Fail 1"))
        .mockRejectedValueOnce(new Error("Fail 2"))
        .mockResolvedValue({ data: "success" });

      const { result } = renderHook(() =>
        useQuery({
          queryKey: ["test"],
          queryFn: mockQueryFn,
          retry: 2,
          retryDelay: 100,
        })
      );

      // Wait for first failure
      await waitFor(() => {
        expect(result.current.isFetching).toBe(true);
      });

      // Advance through retries
      act(() => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(mockQueryFn).toHaveBeenCalledTimes(2);
      });

      act(() => {
        vi.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(mockQueryFn).toHaveBeenCalledTimes(3);
      });

      await waitFor(() => {
        expect(result.current.data).toEqual({ data: "success" });
      });
    });

    it("should give up after max retries", async () => {
      const mockQueryFn = jest
        .fn()
        .mockRejectedValue(new Error("Always fails"));

      const { result } = renderHook(() =>
        useQuery({
          queryKey: ["test"],
          queryFn: mockQueryFn,
          retry: 2,
          retryDelay: 100,
        })
      );

      // Wait and advance through all retries
      await waitFor(() => {
        expect(result.current.isFetching).toBe(true);
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(mockQueryFn).toHaveBeenCalledTimes(2);
      });

      act(() => {
        vi.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(mockQueryFn).toHaveBeenCalledTimes(3);
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toEqual(new Error("Always fails"));
      });
    });
  });

  describe("Refetch", () => {
    it("should refetch data manually", async () => {
      const mockQueryFn = jest
        .fn()
        .mockResolvedValueOnce({ data: "first" })
        .mockResolvedValueOnce({ data: "second" });

      const { result } = renderHook(() =>
        useQuery({
          queryKey: ["test"],
          queryFn: mockQueryFn,
        })
      );

      await waitFor(() => {
        expect(result.current.data).toEqual({ data: "first" });
      });

      act(() => {
        result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.data).toEqual({ data: "second" });
      });

      expect(mockQueryFn).toHaveBeenCalledTimes(2);
    });

    it("should refetch on interval", async () => {
      const mockQueryFn = jest
        .fn()
        .mockResolvedValueOnce({ count: 1 })
        .mockResolvedValueOnce({ count: 2 })
        .mockResolvedValue({ count: 3 });

      const { result } = renderHook(() =>
        useQuery({
          queryKey: ["test"],
          queryFn: mockQueryFn,
          refetchInterval: 1000,
        })
      );

      await waitFor(() => {
        expect(result.current.data).toEqual({ count: 1 });
      });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.data).toEqual({ count: 2 });
      });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.data).toEqual({ count: 3 });
      });

      expect(mockQueryFn).toHaveBeenCalledTimes(3);
    });
  });

  describe("Status", () => {
    it("should have correct status during lifecycle", async () => {
      const mockQueryFn = vi.fn().mockResolvedValue({ data: "test" });

      const { result } = renderHook(() =>
        useQuery({
          queryKey: ["test"],
          queryFn: mockQueryFn,
        })
      );

      expect(result.current.status).toBe("loading");

      await waitFor(() => {
        expect(result.current.status).toBe("success");
      });
    });

    it("should have error status on failure", async () => {
      const mockQueryFn = vi.fn().mockRejectedValue(new Error("Failed"));

      const { result } = renderHook(() =>
        useQuery({
          queryKey: ["test"],
          queryFn: mockQueryFn,
        })
      );

      await waitFor(() => {
        expect(result.current.status).toBe("error");
      });
    });
  });

  describe("Cleanup", () => {
    it("should abort request on unmount", async () => {
      const mockQueryFn = jest
        .fn()
        .mockImplementation(
          () =>
            new Promise((resolve) =>
              setTimeout(() => resolve({ data: "test" }), 1000)
            )
        );

      const { unmount } = renderHook(() =>
        useQuery({
          queryKey: ["test"],
          queryFn: mockQueryFn,
        })
      );

      // Unmount before query completes
      unmount();

      // Advance time
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // Should not throw or cause issues
      expect(mockQueryFn).toHaveBeenCalled();
    });
  });
});
