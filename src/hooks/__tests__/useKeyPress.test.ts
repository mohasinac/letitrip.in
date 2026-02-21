/**
 * useKeyPress Tests — Phase 18.5
 *
 * - Calls callback on matching key
 * - Ignores non-matching keys
 * - Supports array of keys
 * - Enforces modifier keys (ctrl, shift, alt, meta)
 * - Respects enabled=false
 * - Cleans up on unmount
 */

import { renderHook, act } from "@testing-library/react";
import { useKeyPress } from "../useKeyPress";

describe("useKeyPress", () => {
  it("calls callback when matching key is pressed", () => {
    const callback = jest.fn();
    renderHook(() => useKeyPress("Escape", callback));
    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("does NOT call callback for a non-matching key", () => {
    const callback = jest.fn();
    renderHook(() => useKeyPress("Escape", callback));
    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      );
    });
    expect(callback).not.toHaveBeenCalled();
  });

  it("accepts an array of keys and fires on any match", () => {
    const callback = jest.fn();
    renderHook(() => useKeyPress(["Enter", "NumpadEnter"], callback));

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      );
    });
    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "NumpadEnter", bubbles: true }),
      );
    });
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it("fires when ctrl modifier matches", () => {
    const callback = jest.fn();
    renderHook(() => useKeyPress("s", callback, { ctrl: true }));
    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "s",
          ctrlKey: true,
          bubbles: true,
        }),
      );
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("does NOT fire when ctrl modifier expected but not pressed", () => {
    const callback = jest.fn();
    renderHook(() => useKeyPress("s", callback, { ctrl: true }));
    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "s",
          ctrlKey: false,
          bubbles: true,
        }),
      );
    });
    expect(callback).not.toHaveBeenCalled();
  });

  it("does NOT fire when enabled=false", () => {
    const callback = jest.fn();
    renderHook(() => useKeyPress("Escape", callback, { enabled: false }));
    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    });
    expect(callback).not.toHaveBeenCalled();
  });

  it("removes event listener on unmount", () => {
    const callback = jest.fn();
    const { unmount } = renderHook(() => useKeyPress("Escape", callback));
    unmount();
    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    });
    expect(callback).not.toHaveBeenCalled();
  });
});
