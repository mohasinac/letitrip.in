/**
 * useLongPress Tests — Phase 10
 *
 * - Callback fires after the configured hold duration (fake timers)
 * - Callback does NOT fire on a quick tap (pointer-up before threshold)
 * - Cleanup: no callback fires after component unmount
 */

import { renderHook, act } from "@testing-library/react";
import { useLongPress } from "../useLongPress";

describe("useLongPress", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("fires callback after the configured hold duration", () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useLongPress(callback, 500));

    act(() => {
      result.current.onMouseDown();
      jest.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("uses 500 ms as the default hold duration", () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useLongPress(callback));

    act(() => {
      result.current.onMouseDown();
      jest.advanceTimersByTime(499);
    });
    expect(callback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("does NOT fire callback on quick tap (mouse-up before threshold)", () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useLongPress(callback, 500));

    act(() => {
      result.current.onMouseDown();
      jest.advanceTimersByTime(200); // Only half-way through
      result.current.onMouseUp(); // Cancel before threshold
      jest.advanceTimersByTime(400); // Advance past original threshold
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("cancels timer on mouseLeave", () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useLongPress(callback, 500));

    act(() => {
      result.current.onMouseDown();
      jest.advanceTimersByTime(200);
      result.current.onMouseLeave();
      jest.advanceTimersByTime(400);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("fires callback on touchStart after hold duration", () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useLongPress(callback, 300));

    act(() => {
      result.current.onTouchStart();
      jest.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("cancels timer on touchEnd (quick tap via touch)", () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useLongPress(callback, 300));

    act(() => {
      result.current.onTouchStart();
      jest.advanceTimersByTime(100);
      result.current.onTouchEnd();
      jest.advanceTimersByTime(300);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("does not fire callback after component unmount", () => {
    const callback = jest.fn();
    const { result, unmount } = renderHook(() => useLongPress(callback, 500));

    act(() => {
      result.current.onMouseDown();
      jest.advanceTimersByTime(200);
    });

    unmount();

    act(() => {
      jest.advanceTimersByTime(400);
    });

    expect(callback).not.toHaveBeenCalled();
  });
});
