



import { act, renderHook, waitFor } from "@testing-library/react";`nimport { describe, it, expect, beforeEach, vi } from "vitest";
import { useMutation } from "../useMutation";

describe("useMutation", () => {
  describe("Basic functionality", () => {
    it("should execute mutation successfully", async () => {
      const mockMutationFn = jest
        .fn()
        .mockResolvedValue({ id: "123", name: "Test" });

      const { result } = renderHook(() =>
        useMutation({
          mutationFn: mockMutationFn,
        })
      );

      expect(result.current.isIdle).toBe(true);
      expect(result.current.data).toBeUndefined();

      act(() => {
        result.current.mutate({ name: "Test" });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual({ id: "123", name: "Test" });
      expect(result.current.isLoading).toBe(false);
      expect(mockMutationFn).toHaveBeenCalledWith({ name: "Test" });
    });

    it("should handle mutation errors", async () => {
      const mockError = new Error("Mutation failed");
      const mockMutationFn = vi.fn().mockRejectedValue(mockError);

      const { result } = renderHook(() =>
        useMutation({
          mutationFn: mockMutationFn,
        })
      );

      act(() => {
        result.current.mutate({ name: "Test" });
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
      expect(result.current.data).toBeUndefined();
    });

    it("should support mutateAsync for promise-based usage", async () => {
      const mockMutationFn = vi.fn().mockResolvedValue({ id: "123" });

      const { result } = renderHook(() =>
        useMutation({
          mutationFn: mockMutationFn,
        })
      );

      let data;
      await act(async () => {
        data = await result.current.mutateAsync({ name: "Test" });
      });

      expect(data).toEqual({ id: "123" });
      expect(result.current.data).toEqual({ id: "123" });
    });

    it("should throw error in mutateAsync", async () => {
      const mockError = new Error("Failed");
      const mockMutationFn = vi.fn().mockRejectedValue(mockError);

      const { result } = renderHook(() =>
        useMutation({
          mutationFn: mockMutationFn,
        })
      );

      await expect(
        act(async () => {
          await result.current.mutateAsync({ name: "Test" });
        })
      ).rejects.toThrow("Failed");
    });
  });

  describe("Callbacks", () => {
    it("should call onSuccess when mutation succeeds", async () => {
      const mockOnSuccess = vi.fn();
      const mockMutationFn = vi.fn().mockResolvedValue({ id: "123" });

      const { result } = renderHook(() =>
        useMutation({
          mutationFn: mockMutationFn,
          onSuccess: mockOnSuccess,
        })
      );

      act(() => {
        result.current.mutate({ name: "Test" });
      });

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith(
          { id: "123" },
          { name: "Test" },
          undefined
        );
      });
    });

    it("should call onError when mutation fails", async () => {
      const mockOnError = vi.fn();
      const mockError = new Error("Failed");
      const mockMutationFn = vi.fn().mockRejectedValue(mockError);

      const { result } = renderHook(() =>
        useMutation({
          mutationFn: mockMutationFn,
          onError: mockOnError,
        })
      );

      act(() => {
        result.current.mutate({ name: "Test" });
      });

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(
          mockError,
          { name: "Test" },
          undefined
        );
      });
    });

    it("should call onSettled on success", async () => {
      const mockOnSettled = vi.fn();
      const mockMutationFn = vi.fn().mockResolvedValue({ id: "123" });

      const { result } = renderHook(() =>
        useMutation({
          mutationFn: mockMutationFn,
          onSettled: mockOnSettled,
        })
      );

      act(() => {
        result.current.mutate({ name: "Test" });
      });

      await waitFor(() => {
        expect(mockOnSettled).toHaveBeenCalledWith(
          { id: "123" },
          null,
          { name: "Test" },
          undefined
        );
      });
    });

    it("should call onSettled on error", async () => {
      const mockOnSettled = vi.fn();
      const mockError = new Error("Failed");
      const mockMutationFn = vi.fn().mockRejectedValue(mockError);

      const { result } = renderHook(() =>
        useMutation({
          mutationFn: mockMutationFn,
          onSettled: mockOnSettled,
        })
      );

      act(() => {
        result.current.mutate({ name: "Test" });
      });

      await waitFor(() => {
        expect(mockOnSettled).toHaveBeenCalledWith(
          undefined,
          mockError,
          { name: "Test" },
          undefined
        );
      });
    });

    it("should call onMutate before mutation", async () => {
      const mockOnMutate = vi.fn().mockReturnValue({ previous: "data" });
      const mockMutationFn = vi.fn().mockResolvedValue({ id: "123" });

      const { result } = renderHook(() =>
        useMutation({
          mutationFn: mockMutationFn,
          onMutate: mockOnMutate,
        })
      );

      act(() => {
        result.current.mutate({ name: "Test" });
      });

      await waitFor(() => {
        expect(mockOnMutate).toHaveBeenCalledWith({ name: "Test" });
      });
    });

    it("should pass context from onMutate to onSuccess", async () => {
      const mockOnMutate = vi.fn().mockReturnValue({ previous: "old data" });
      const mockOnSuccess = vi.fn();
      const mockMutationFn = vi.fn().mockResolvedValue({ id: "123" });

      const { result } = renderHook(() =>
        useMutation({
          mutationFn: mockMutationFn,
          onMutate: mockOnMutate,
          onSuccess: mockOnSuccess,
        })
      );

      act(() => {
        result.current.mutate({ name: "Test" });
      });

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith(
          { id: "123" },
          { name: "Test" },
          { previous: "old data" }
        );
      });
    });

    it("should pass context from onMutate to onError", async () => {
      const mockOnMutate = vi.fn().mockReturnValue({ previous: "old data" });
      const mockOnError = vi.fn();
      const mockError = new Error("Failed");
      const mockMutationFn = vi.fn().mockRejectedValue(mockError);

      const { result } = renderHook(() =>
        useMutation({
          mutationFn: mockMutationFn,
          onMutate: mockOnMutate,
          onError: mockOnError,
        })
      );

      act(() => {
        result.current.mutate({ name: "Test" });
      });

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith(
          mockError,
          { name: "Test" },
          { previous: "old data" }
        );
      });
    });
  });

  describe("Retry", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    });

    it("should retry on failure", async () => {
      const mockMutationFn = jest
        .fn()
        .mockRejectedValueOnce(new Error("Fail 1"))
        .mockRejectedValueOnce(new Error("Fail 2"))
        .mockResolvedValue({ id: "123" });

      const { result } = renderHook(() =>
        useMutation({
          mutationFn: mockMutationFn,
          retry: 2,
          retryDelay: 100,
        })
      );

      act(() => {
        result.current.mutate({ name: "Test" });
      });

      // Wait for first attempt
      await waitFor(() => {
        expect(mockMutationFn).toHaveBeenCalledTimes(1);
      });

      // Advance to first retry
      act(() => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(mockMutationFn).toHaveBeenCalledTimes(2);
      });

      // Advance to second retry
      act(() => {
        vi.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(mockMutationFn).toHaveBeenCalledTimes(3);
      });

      await waitFor(() => {
        expect(result.current.data).toEqual({ id: "123" });
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it("should give up after max retries", async () => {
      const mockMutationFn = jest
        .fn()
        .mockRejectedValue(new Error("Always fails"));

      const { result } = renderHook(() =>
        useMutation({
          mutationFn: mockMutationFn,
          retry: 2,
          retryDelay: 100,
        })
      );

      act(() => {
        result.current.mutate({ name: "Test" });
      });

      await waitFor(() => {
        expect(mockMutationFn).toHaveBeenCalledTimes(1);
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(mockMutationFn).toHaveBeenCalledTimes(2);
      });

      act(() => {
        vi.advanceTimersByTime(200);
      });

      await waitFor(() => {
        expect(mockMutationFn).toHaveBeenCalledTimes(3);
        expect(result.current.isError).toBe(true);
        expect(result.current.error).toEqual(new Error("Always fails"));
      });
    });
  });

  describe("Reset", () => {
    it("should reset mutation state", async () => {
      const mockMutationFn = vi.fn().mockResolvedValue({ id: "123" });

      const { result } = renderHook(() =>
        useMutation({
          mutationFn: mockMutationFn,
        })
      );

      act(() => {
        result.current.mutate({ name: "Test" });
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeNull();
      expect(result.current.isIdle).toBe(true);
      expect(result.current.status).toBe("idle");
    });
  });

  describe("Status", () => {
    it("should have correct status during lifecycle", async () => {
      const mockMutationFn = vi.fn().mockResolvedValue({ id: "123" });

      const { result } = renderHook(() =>
        useMutation({
          mutationFn: mockMutationFn,
        })
      );

      expect(result.current.status).toBe("idle");

      act(() => {
        result.current.mutate({ name: "Test" });
      });

      await waitFor(() => {
        expect(result.current.status).toBe("loading");
      });

      await waitFor(() => {
        expect(result.current.status).toBe("success");
      });
    });

    it("should have error status on failure", async () => {
      const mockMutationFn = vi.fn().mockRejectedValue(new Error("Failed"));

      const { result } = renderHook(() =>
        useMutation({
          mutationFn: mockMutationFn,
        })
      );

      act(() => {
        result.current.mutate({ name: "Test" });
      });

      await waitFor(() => {
        expect(result.current.status).toBe("error");
      });
    });
  });

  describe("Multiple mutations", () => {
    it("should handle multiple sequential mutations", async () => {
      const mockMutationFn = jest
        .fn()
        .mockResolvedValueOnce({ id: "1" })
        .mockResolvedValueOnce({ id: "2" });

      const { result } = renderHook(() =>
        useMutation({
          mutationFn: mockMutationFn,
        })
      );

      act(() => {
        result.current.mutate({ name: "First" });
      });

      await waitFor(() => {
        expect(result.current.data).toEqual({ id: "1" });
      });

      act(() => {
        result.current.mutate({ name: "Second" });
      });

      await waitFor(() => {
        expect(result.current.data).toEqual({ id: "2" });
      });

      expect(mockMutationFn).toHaveBeenCalledTimes(2);
    });
  });

  describe("Cleanup", () => {
    it("should handle unmount during mutation", async () => {
      const mockMutationFn = jest
        .fn()
        .mockImplementation(
          () =>
            new Promise((resolve) =>
              setTimeout(() => resolve({ id: "123" }), 1000)
            )
        );

      const { result, unmount } = renderHook(() =>
        useMutation({
          mutationFn: mockMutationFn,
        })
      );

      act(() => {
        result.current.mutate({ name: "Test" });
      });

      // Unmount before mutation completes
      unmount();

      // Should not throw or cause issues
      expect(mockMutationFn).toHaveBeenCalled();
    });
  });
});
