/**
 * useMediaQuery Tests — Phase 18.5
 *
 * - Returns correct boolean based on matchMedia result
 * - Updates state when media query change event fires
 * - Registers and removes change listener correctly
 */

import { renderHook, act } from "@testing-library/react";
import { useMediaQuery } from "../useMediaQuery";

describe("useMediaQuery", () => {
  let changeListeners: ((e: { matches: boolean }) => void)[];

  const setupMatchMedia = (matches: boolean) => {
    changeListeners = [];
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn((query: string) => ({
        matches,
        media: query,
        addEventListener: jest.fn(
          (_: string, cb: (e: { matches: boolean }) => void) => {
            changeListeners.push(cb);
          },
        ),
        removeEventListener: jest.fn(),
      })),
    });
  };

  it("returns true when media query matches", () => {
    setupMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(true);
  });

  it("returns false when media query does not match", () => {
    setupMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(false);
  });

  it("updates when media query change event fires", () => {
    setupMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(result.current).toBe(false);

    act(() => {
      changeListeners.forEach((cb) => cb({ matches: true }));
    });

    expect(result.current).toBe(true);
  });

  it("registers a change event listener on mount", () => {
    setupMatchMedia(false);
    renderHook(() => useMediaQuery("(min-width: 768px)"));
    expect(window.matchMedia).toHaveBeenCalledWith("(min-width: 768px)");
    expect(changeListeners.length).toBeGreaterThan(0);
  });

  it("removes event listener on unmount", () => {
    const removeListenerMock = jest.fn();
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn((query: string) => ({
        matches: false,
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: removeListenerMock,
      })),
    });
    const { unmount } = renderHook(() => useMediaQuery("(min-width: 768px)"));
    unmount();
    expect(removeListenerMock).toHaveBeenCalledWith(
      "change",
      expect.any(Function),
    );
  });

  it("calls window.matchMedia with the exact query string provided", () => {
    setupMatchMedia(false);
    renderHook(() => useMediaQuery("(prefers-color-scheme: dark)"));
    expect(window.matchMedia).toHaveBeenCalledWith(
      "(prefers-color-scheme: dark)",
    );
  });
});
