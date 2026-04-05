/**
 * useBulkAction Tests
 *
 * Verifies: initial state, execute (immediate), execute with confirm,
 * confirmAndExecute, cancelConfirm, reset, and error handling.
 */

import { renderHook, act } from "@testing-library/react";
import { useBulkAction } from "../useBulkAction";
import { ApiClientError } from "@mohasinac/http";
import type { BulkActionResult } from "@mohasinac/react";

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────

function makeResult(
  action: string,
  succeeded: number,
  failed: number = 0,
): BulkActionResult {
  return {
    action,
    summary: {
      total: succeeded + failed,
      succeeded,
      skipped: 0,
      failed,
    },
    succeeded: Array.from({ length: succeeded }, (_, i) => `id-${i}`),
    skipped: [],
    failed: Array.from({ length: failed }, (_, i) => ({
      id: `fail-${i}`,
      reason: "Not found",
    })),
  };
}

const basePayload = { action: "publish", ids: ["1", "2", "3"] };

// ──────────────────────────────────────────────────────────
// Tests
// ──────────────────────────────────────────────────────────

describe("useBulkAction", () => {
  // ──────────────────────────────────────────────────────
  // Initial state
  // ──────────────────────────────────────────────────────
  describe("initial state", () => {
    it("returns all-null state before first call", () => {
      const { result } = renderHook(() =>
        useBulkAction({ mutationFn: jest.fn() }),
      );

      expect(result.current.isLoading).toBe(false);
      expect(result.current.result).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.pendingPayload).toBeNull();
    });
  });

  // ──────────────────────────────────────────────────────
  // execute — immediate (no confirm)
  // ──────────────────────────────────────────────────────
  describe("execute — immediate", () => {
    it("calls mutationFn with the payload and stores the result", async () => {
      const mockResult = makeResult("publish", 3);
      const mutationFn = jest.fn().mockResolvedValue(mockResult);
      const onSuccess = jest.fn();

      const { result } = renderHook(() =>
        useBulkAction({ mutationFn, onSuccess }),
      );

      await act(async () => {
        await result.current.execute(basePayload);
      });

      expect(mutationFn).toHaveBeenCalledWith(basePayload);
      expect(result.current.result).toEqual(mockResult);
      expect(result.current.isLoading).toBe(false);
      expect(onSuccess).toHaveBeenCalledWith(mockResult, basePayload);
    });

    it("sets isLoading to true while mutation is in flight", async () => {
      let resolve!: (v: BulkActionResult) => void;
      const mutationFn = jest.fn().mockReturnValue(
        new Promise<BulkActionResult>((r) => {
          resolve = r;
        }),
      );

      const { result } = renderHook(() => useBulkAction({ mutationFn }));

      act(() => {
        void result.current.execute(basePayload);
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolve(makeResult("publish", 3));
      });

      expect(result.current.isLoading).toBe(false);
    });

    it("captures ApiClientError and calls onError", async () => {
      const apiErr = new ApiClientError("Forbidden", 403);
      const mutationFn = jest.fn().mockRejectedValue(apiErr);
      const onError = jest.fn();

      const { result } = renderHook(() =>
        useBulkAction({ mutationFn, onError }),
      );

      await act(async () => {
        await result.current.execute(basePayload);
      });

      expect(result.current.error).toBe(apiErr);
      expect(result.current.isLoading).toBe(false);
      expect(onError).toHaveBeenCalledWith(apiErr, basePayload);
    });

    it("wraps non-ApiClientError thrown values in ApiClientError", async () => {
      const mutationFn = jest.fn().mockRejectedValue(new Error("network fail"));

      const { result } = renderHook(() => useBulkAction({ mutationFn }));

      await act(async () => {
        await result.current.execute(basePayload);
      });

      expect(result.current.error).toBeInstanceOf(ApiClientError);
      expect(result.current.error?.message).toBe("network fail");
    });

    it("does not set pendingPayload when requiresConfirm is false", async () => {
      const mutationFn = jest.fn().mockResolvedValue(makeResult("publish", 2));

      const { result } = renderHook(() =>
        useBulkAction({ mutationFn, requiresConfirm: false }),
      );

      await act(async () => {
        await result.current.execute(basePayload);
      });

      expect(result.current.pendingPayload).toBeNull();
    });
  });

  // ──────────────────────────────────────────────────────
  // execute — with requiresConfirm
  // ──────────────────────────────────────────────────────
  describe("execute — with confirm", () => {
    it("does NOT call mutationFn; parks payload in pendingPayload", async () => {
      const mutationFn = jest.fn().mockResolvedValue(makeResult("delete", 2));

      const { result } = renderHook(() =>
        useBulkAction({ mutationFn, requiresConfirm: true }),
      );

      const deletePayload = {
        action: "delete",
        ids: ["1", "2"],
        confirm: true,
      };

      await act(async () => {
        await result.current.execute(deletePayload);
      });

      expect(mutationFn).not.toHaveBeenCalled();
      expect(result.current.pendingPayload).toEqual(deletePayload);
      expect(result.current.isLoading).toBe(false);
    });
  });

  // ──────────────────────────────────────────────────────
  // confirmAndExecute
  // ──────────────────────────────────────────────────────
  describe("confirmAndExecute", () => {
    it("runs the mutation with the parked payload and clears pendingPayload", async () => {
      const mockResult = makeResult("delete", 2);
      const mutationFn = jest.fn().mockResolvedValue(mockResult);
      const onSuccess = jest.fn();

      const { result } = renderHook(() =>
        useBulkAction({ mutationFn, requiresConfirm: true, onSuccess }),
      );

      const deletePayload = {
        action: "delete",
        ids: ["1", "2"],
        confirm: true,
      };

      await act(async () => {
        await result.current.execute(deletePayload);
      });

      await act(async () => {
        await result.current.confirmAndExecute();
      });

      expect(mutationFn).toHaveBeenCalledWith(deletePayload);
      expect(result.current.result).toEqual(mockResult);
      expect(result.current.pendingPayload).toBeNull();
      expect(onSuccess).toHaveBeenCalledWith(mockResult, deletePayload);
    });

    it("is a no-op when pendingPayload is null", async () => {
      const mutationFn = jest.fn();

      const { result } = renderHook(() =>
        useBulkAction({ mutationFn, requiresConfirm: true }),
      );

      await act(async () => {
        await result.current.confirmAndExecute();
      });

      expect(mutationFn).not.toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────────────
  // cancelConfirm
  // ──────────────────────────────────────────────────────
  describe("cancelConfirm", () => {
    it("clears pendingPayload without calling mutationFn", async () => {
      const mutationFn = jest.fn();

      const { result } = renderHook(() =>
        useBulkAction({ mutationFn, requiresConfirm: true }),
      );

      await act(async () => {
        await result.current.execute({ action: "delete", ids: ["x"] });
      });

      act(() => result.current.cancelConfirm());

      expect(result.current.pendingPayload).toBeNull();
      expect(mutationFn).not.toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────────────
  // reset
  // ──────────────────────────────────────────────────────
  describe("reset", () => {
    it("clears result, error, and pendingPayload", async () => {
      const mutationFn = jest.fn().mockResolvedValue(makeResult("publish", 1));

      const { result } = renderHook(() => useBulkAction({ mutationFn }));

      await act(async () => {
        await result.current.execute(basePayload);
      });

      act(() => result.current.reset());

      expect(result.current.result).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.pendingPayload).toBeNull();
    });
  });
});
