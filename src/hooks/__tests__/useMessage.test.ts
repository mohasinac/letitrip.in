/**
 * useMessage Tests — Phase 18.2
 *
 * Verifies temporary message state hook: showSuccess, showError,
 * clearMessage, auto-dismiss timer, and timer reset on new message.
 */

import { renderHook, act } from "@testing-library/react";
import { useMessage } from "../useMessage";

describe("useMessage", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ============================================================
  // Initial state
  // ============================================================
  describe("initial state", () => {
    it("has null message on first render", () => {
      const { result } = renderHook(() => useMessage());
      expect(result.current.message).toBeNull();
    });
  });

  // ============================================================
  // showSuccess
  // ============================================================
  describe("showSuccess()", () => {
    it("sets message with type 'success' and correct text", () => {
      const { result } = renderHook(() => useMessage());

      act(() => {
        result.current.showSuccess("Item saved!");
      });

      expect(result.current.message).toEqual({
        type: "success",
        text: "Item saved!",
      });
    });
  });

  // ============================================================
  // showError
  // ============================================================
  describe("showError()", () => {
    it("sets message with type 'error' and correct text", () => {
      const { result } = renderHook(() => useMessage());

      act(() => {
        result.current.showError("Something went wrong");
      });

      expect(result.current.message).toEqual({
        type: "error",
        text: "Something went wrong",
      });
    });
  });

  // ============================================================
  // clearMessage
  // ============================================================
  describe("clearMessage()", () => {
    it("resets message to null immediately", () => {
      const { result } = renderHook(() => useMessage());

      act(() => {
        result.current.showSuccess("Done");
      });
      expect(result.current.message).not.toBeNull();

      act(() => {
        result.current.clearMessage();
      });
      expect(result.current.message).toBeNull();
    });

    it("cancels the auto-dismiss timer so it does not fire after clearMessage", () => {
      const { result } = renderHook(() => useMessage());

      act(() => {
        result.current.showSuccess("Cleared early");
      });

      act(() => {
        result.current.clearMessage();
        jest.advanceTimersByTime(5000); // timer should already be cancelled
      });

      expect(result.current.message).toBeNull();
    });
  });

  // ============================================================
  // Auto-dismiss
  // ============================================================
  describe("auto-dismiss", () => {
    it("message auto-dismisses after exactly 5000ms", () => {
      const { result } = renderHook(() => useMessage());

      act(() => {
        result.current.showSuccess("Auto dismiss");
      });
      expect(result.current.message).not.toBeNull();

      act(() => {
        jest.advanceTimersByTime(5000);
      });

      expect(result.current.message).toBeNull();
    });

    it("message persists just before the 5000ms threshold", () => {
      const { result } = renderHook(() => useMessage());

      act(() => {
        result.current.showError("Persists");
      });

      act(() => {
        jest.advanceTimersByTime(4999);
      });

      expect(result.current.message).not.toBeNull();
    });
  });

  // ============================================================
  // Timer reset on new message
  // ============================================================
  describe("timer reset", () => {
    it("calling showSuccess while a message is showing resets the 5s timer", () => {
      const { result } = renderHook(() => useMessage());

      act(() => {
        result.current.showError("First error");
      });

      // 3 s into first message's timer
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Replace with a new message — timer should reset
      act(() => {
        result.current.showSuccess("Second message");
      });

      expect(result.current.message).toEqual({
        type: "success",
        text: "Second message",
      });

      // 4999ms after reset — message should still be visible
      act(() => {
        jest.advanceTimersByTime(4999);
      });
      expect(result.current.message).not.toBeNull();

      // 1ms more — now at 5000ms from second message, should be gone
      act(() => {
        jest.advanceTimersByTime(1);
      });
      expect(result.current.message).toBeNull();
    });

    it("calling showError replaces a success message", () => {
      const { result } = renderHook(() => useMessage());

      act(() => {
        result.current.showSuccess("Success");
      });

      act(() => {
        result.current.showError("Error followed");
      });

      expect(result.current.message?.type).toBe("error");
      expect(result.current.message?.text).toBe("Error followed");
    });
  });
});
