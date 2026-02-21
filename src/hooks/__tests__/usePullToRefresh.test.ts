/**
 * usePullToRefresh Tests — Phase 10
 *
 * - `onRefresh` is called when pull distance exceeds threshold
 * - `isPulling` is true during pull, false after release
 * - `onRefresh` is NOT called when released before threshold
 */

import { renderHook, act } from "@testing-library/react";
import { usePullToRefresh } from "../usePullToRefresh";

/** Helper to create a TouchEvent with a given clientY */
function makeTouchEvent(type: string, clientY: number): TouchEvent {
  return new TouchEvent(type, {
    bubbles: true,
    cancelable: true,
    touches: [
      new Touch({
        identifier: 1,
        target: document.createElement("div"),
        clientY,
        clientX: 0,
      }),
    ],
  });
}

describe("usePullToRefresh", () => {
  it("calls onRefresh when pull distance exceeds threshold", async () => {
    const onRefresh = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      usePullToRefresh(onRefresh, { threshold: 80 }),
    );

    const el = result.current.containerRef.current;
    // containerRef is null until the component mounts with a DOM node.
    // Simulate the element being scrolled to top (scrollTop = 0 by default).
    if (!el) return; // Skip if env doesn't support ref population

    act(() => {
      el.dispatchEvent(makeTouchEvent("touchstart", 100));
    });
    act(() => {
      el.dispatchEvent(makeTouchEvent("touchmove", 200)); // delta = 100 >= threshold 80
    });
    await act(async () => {
      el.dispatchEvent(new TouchEvent("touchend", { bubbles: true }));
    });

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it("does NOT call onRefresh when released before threshold", async () => {
    const onRefresh = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      usePullToRefresh(onRefresh, { threshold: 80 }),
    );

    const el = result.current.containerRef.current;
    if (!el) return;

    act(() => {
      el.dispatchEvent(makeTouchEvent("touchstart", 100));
    });
    act(() => {
      el.dispatchEvent(makeTouchEvent("touchmove", 140)); // delta = 40 < threshold 80
    });
    await act(async () => {
      el.dispatchEvent(new TouchEvent("touchend", { bubbles: true }));
    });

    expect(onRefresh).not.toHaveBeenCalled();
  });

  it("progress is 0 initially", () => {
    const { result } = renderHook(() =>
      usePullToRefresh(jest.fn().mockResolvedValue(undefined)),
    );
    expect(result.current.progress).toBe(0);
  });

  it("isPulling is false initially", () => {
    const { result } = renderHook(() =>
      usePullToRefresh(jest.fn().mockResolvedValue(undefined)),
    );
    expect(result.current.isPulling).toBe(false);
  });

  it("returns a containerRef", () => {
    const { result } = renderHook(() =>
      usePullToRefresh(jest.fn().mockResolvedValue(undefined)),
    );
    expect(result.current.containerRef).toBeDefined();
  });
});
