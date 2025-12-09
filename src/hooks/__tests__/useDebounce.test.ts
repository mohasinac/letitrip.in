import { act, renderHook } from "@testing-library/react";
import { useDebounce, useDebouncedCallback, useThrottle } from "../useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 500));
    expect(result.current).toBe("initial");
  });

  it("debounces value changes", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 500 } }
    );

    expect(result.current).toBe("initial");

    // Change value
    rerender({ value: "changed", delay: 500 });

    // Value should not change immediately
    expect(result.current).toBe("initial");

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Value should now be updated
    expect(result.current).toBe("changed");
  });

  it("resets timer on rapid changes", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: "initial" } }
    );

    // Change value multiple times rapidly
    rerender({ value: "change1" });
    act(() => {
      jest.advanceTimersByTime(250);
    });

    rerender({ value: "change2" });
    act(() => {
      jest.advanceTimersByTime(250);
    });

    // Should still be initial value
    expect(result.current).toBe("initial");

    // Complete the delay
    act(() => {
      jest.advanceTimersByTime(250);
    });

    // Should now be the last value
    expect(result.current).toBe("change2");
  });

  it("handles different data types", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: { count: 0 } } }
    );

    expect(result.current).toEqual({ count: 0 });

    rerender({ value: { count: 1 } });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toEqual({ count: 1 });
  });

  it("uses custom delay", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: "initial", delay: 1000 } }
    );

    rerender({ value: "changed", delay: 1000 });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe("initial");

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe("changed");
  });
});

describe("useDebouncedCallback", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("debounces callback execution", () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    act(() => {
      result.current("test");
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledWith("test");
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("cancels previous timeout on rapid calls", () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    act(() => {
      result.current("first");
    });

    act(() => {
      jest.advanceTimersByTime(250);
    });

    act(() => {
      result.current("second");
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledWith("second");
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("handles multiple arguments", () => {
    const callback = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 500));

    act(() => {
      result.current("arg1", "arg2", "arg3");
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledWith("arg1", "arg2", "arg3");
  });

  it("cleans up timeout on unmount", () => {
    const callback = jest.fn();
    const { result, unmount } = renderHook(() =>
      useDebouncedCallback(callback, 500)
    );

    act(() => {
      result.current("test");
    });

    unmount();

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(callback).not.toHaveBeenCalled();
  });
});

describe("useThrottle", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useThrottle("initial", 500));
    expect(result.current).toBe("initial");
  });

  it("throttles value changes", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 500),
      { initialProps: { value: "initial" } }
    );

    expect(result.current).toBe("initial");

    // Immediately change value - should update because first execution
    rerender({ value: "changed" });

    // Advance timers to process the change
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe("changed");
  });

  it("handles rapid changes correctly", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 500),
      {
        initialProps: { value: 0 },
      }
    );

    expect(result.current).toBe(0);

    // First change - should update immediately
    rerender({ value: 1 });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe(1);

    // Rapid changes within interval
    rerender({ value: 2 });
    rerender({ value: 3 });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    // Should have the last value after interval
    expect(result.current).toBe(3);
  });

  it("uses custom interval", () => {
    const { result, rerender } = renderHook(
      ({ value, interval }) => useThrottle(value, interval),
      { initialProps: { value: "initial", interval: 1000 } }
    );

    expect(result.current).toBe("initial");

    rerender({ value: "changed", interval: 1000 });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current).toBe("changed");
  });
});
