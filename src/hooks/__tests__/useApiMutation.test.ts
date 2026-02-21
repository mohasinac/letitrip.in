/**
 * useApiMutation Tests — Phase 18.2
 *
 * Verifies mutation hook: initial state, loading, success, error,
 * callbacks (onSuccess, onError, onSettled), and reset().
 */

import { renderHook, act } from "@testing-library/react";
import { useApiMutation } from "../useApiMutation";
import { ApiClientError } from "@/lib/api-client";

describe("useApiMutation", () => {
  // ============================================================
  // Initial State
  // ============================================================
  describe("initial state", () => {
    it("returns isLoading=false and no error in initial state", () => {
      const { result } = renderHook(() =>
        useApiMutation({ mutationFn: jest.fn() }),
      );

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.data).toBeUndefined();
    });
  });

  // ============================================================
  // Loading
  // ============================================================
  describe("loading", () => {
    it("sets isLoading=true while mutation is in flight", async () => {
      let resolve!: (value: string) => void;
      const mutationFn = jest.fn().mockReturnValue(
        new Promise<string>((r) => {
          resolve = r;
        }),
      );
      const { result } = renderHook(() => useApiMutation({ mutationFn }));

      // Start mutation without awaiting it
      act(() => {
        result.current.mutate("input");
      });

      expect(result.current.isLoading).toBe(true);

      // Resolve and clean up
      await act(async () => {
        resolve("done");
      });
    });
  });

  // ============================================================
  // Success
  // ============================================================
  describe("success", () => {
    it("resolves data and resets isLoading on success", async () => {
      const mutationFn = jest.fn().mockResolvedValue({ id: 42 });
      const { result } = renderHook(() => useApiMutation({ mutationFn }));

      await act(async () => {
        await result.current.mutate({ name: "test" });
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual({ id: 42 });
      expect(result.current.error).toBeNull();
    });

    it("calls onSuccess callback with response data and variables on success", async () => {
      const onSuccess = jest.fn();
      const mutationFn = jest.fn().mockResolvedValue({ created: true });
      const { result } = renderHook(() =>
        useApiMutation({ mutationFn, onSuccess }),
      );

      await act(async () => {
        await result.current.mutate({ field: "value" });
      });

      expect(onSuccess).toHaveBeenCalledWith(
        { created: true },
        { field: "value" },
      );
    });

    it("calls onSettled with data and null error on success", async () => {
      const onSettled = jest.fn();
      const mutationFn = jest.fn().mockResolvedValue("result");
      const { result } = renderHook(() =>
        useApiMutation({ mutationFn, onSettled }),
      );

      await act(async () => {
        await result.current.mutate("vars");
      });

      expect(onSettled).toHaveBeenCalledWith("result", null, "vars");
    });
  });

  // ============================================================
  // Failure
  // ============================================================
  describe("failure", () => {
    it("sets error and resets isLoading when mutationFn rejects", async () => {
      const mutationFn = jest.fn().mockRejectedValue(new Error("Server error"));
      const { result } = renderHook(() => useApiMutation({ mutationFn }));

      await act(async () => {
        try {
          await result.current.mutate({});
        } catch (_) {
          // expected
        }
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).not.toBeNull();
      expect(result.current.error?.message).toBe("Server error");
    });

    it("preserves ApiClientError status when server responds with 4xx", async () => {
      const apiError = new ApiClientError("Unauthorized", 401);
      const mutationFn = jest.fn().mockRejectedValue(apiError);
      const { result } = renderHook(() => useApiMutation({ mutationFn }));

      await act(async () => {
        try {
          await result.current.mutate({});
        } catch (_) {
          // expected
        }
      });

      expect(result.current.error).toBe(apiError);
      expect(result.current.error?.status).toBe(401);
    });

    it("calls onError callback with wrapped error on failure", async () => {
      const onError = jest.fn();
      const mutationFn = jest.fn().mockRejectedValue(new Error("fail"));
      const { result } = renderHook(() =>
        useApiMutation({ mutationFn, onError }),
      );

      await act(async () => {
        try {
          await result.current.mutate({});
        } catch (_) {
          // expected
        }
      });

      expect(onError).toHaveBeenCalled();
      expect(onError.mock.calls[0][0].message).toBe("fail");
    });

    it("calls onSettled with undefined data and error on failure", async () => {
      const onSettled = jest.fn();
      const error = new Error("fail");
      const mutationFn = jest.fn().mockRejectedValue(error);
      const { result } = renderHook(() =>
        useApiMutation({ mutationFn, onSettled }),
      );

      await act(async () => {
        try {
          await result.current.mutate("vars");
        } catch (_) {
          // expected
        }
      });

      expect(onSettled).toHaveBeenCalled();
      expect(onSettled.mock.calls[0][0]).toBeUndefined(); // data
      expect(onSettled.mock.calls[0][1]).not.toBeNull(); // error
      expect(onSettled.mock.calls[0][2]).toBe("vars"); // variables
    });
  });

  // ============================================================
  // reset()
  // ============================================================
  describe("reset()", () => {
    it("reset() clears error and data back to initial state", async () => {
      const mutationFn = jest.fn().mockRejectedValue(new Error("fail"));
      const { result } = renderHook(() => useApiMutation({ mutationFn }));

      await act(async () => {
        try {
          await result.current.mutate({});
        } catch (_) {
          // expected
        }
      });

      expect(result.current.error).not.toBeNull();

      act(() => {
        result.current.reset();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });

    it("reset() after success clears data", async () => {
      const mutationFn = jest.fn().mockResolvedValue({ id: 1 });
      const { result } = renderHook(() => useApiMutation({ mutationFn }));

      await act(async () => {
        await result.current.mutate({});
      });

      expect(result.current.data).toEqual({ id: 1 });

      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toBeUndefined();
    });
  });
});
