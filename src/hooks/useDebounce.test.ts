/**
 * Tests for useDebounce.ts
 * Testing debounce, throttle, and API hooks
 */

import {
  describe,
  it,
  expect,
  jest,
  beforeEach,
  afterEach,
} from "@jest/globals";
import { renderHook, act, waitFor } from "@testing-library/react";
import {
  useDebounce,
  useDebouncedCallback,
  useThrottle,
  useApi,
} from "./useDebounce";

// Mock timers
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

describe("useDebounce", () => {
  it("should return initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 500));

    expect(result.current).toBe("initial");
  });

  it("should debounce value changes", async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 500 },
      }
    );

    // Initial value
    expect(result.current).toBe("initial");

    // Change value
    rerender({ value: "changed", delay: 500 });
    expect(result.current).toBe("initial"); // Should still be old value

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(result.current).toBe("changed");
    });
  });

  it("should reset debounce timer on value change", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: "initial" },
      }
    );

    // Change value
    rerender({ value: "first" });
    expect(result.current).toBe("initial");

    // Advance halfway
    act(() => {
      jest.advanceTimersByTime(250);
    });

    // Change value again before debounce completes
    rerender({ value: "second" });

    // Advance another 250ms (total 500ms from second change)
    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(result.current).toBe("initial"); // Should still be initial

    // Advance another 250ms to complete debounce
    act(() => {
      jest.advanceTimersByTime(250);
    });

    expect(result.current).toBe("second");
  });

  it("should handle delay changes", () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: "initial", delay: 1000 },
      }
    );

    rerender({ value: "changed", delay: 1000 });
    expect(result.current).toBe("initial");

    // Advance 500ms
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe("initial"); // Should still be initial

    // Advance another 500ms
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe("changed");
  });
});

describe("useDebouncedCallback", () => {
  it("should debounce callback execution", async () => {
    const mockCallback = jest.fn();
    const { result } = renderHook(() =>
      useDebouncedCallback(mockCallback, 500)
    );

    // Call debounced function multiple times quickly
    act(() => {
      result.current();
      result.current();
      result.current();
    });

    // Callback should not have been called yet
    expect(mockCallback).not.toHaveBeenCalled();

    // Advance time
    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalledTimes(1);
    });
  });

  it("should pass arguments to callback", async () => {
    const mockCallback = jest.fn();
    const { result } = renderHook(() =>
      useDebouncedCallback(mockCallback, 500)
    );

    act(() => {
      result.current("arg1", "arg2", 123);
    });

    act(() => {
      jest.advanceTimersByTime(500);
    });

    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalledWith("arg1", "arg2", 123);
    });
  });

  it("should reset timer on multiple calls", () => {
    const mockCallback = jest.fn();
    const { result } = renderHook(() =>
      useDebouncedCallback(mockCallback, 500)
    );

    act(() => {
      result.current();
    });

    // Advance 300ms
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Call again - should reset timer
    act(() => {
      result.current();
    });

    // Advance another 300ms (total 600ms from first call)
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(mockCallback).not.toHaveBeenCalled();

    // Advance another 200ms to complete debounce
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(mockCallback).toHaveBeenCalledTimes(1);
  });

  it("should cleanup timeout on unmount", () => {
    const mockCallback = jest.fn();
    const { result, unmount } = renderHook(() =>
      useDebouncedCallback(mockCallback, 500)
    );

    act(() => {
      result.current();
    });

    unmount();

    // Advance time - callback should not be called since timeout was cleared
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockCallback).not.toHaveBeenCalled();
  });
});

describe("useThrottle", () => {
  it("should return initial value immediately", () => {
    const { result } = renderHook(() => useThrottle("initial", 500));

    expect(result.current).toBe("initial");
  });

  it("should throttle value changes", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 500),
      {
        initialProps: { value: "initial" },
      }
    );

    // Initial value
    expect(result.current).toBe("initial");

    // Change value - should not update immediately due to throttling
    rerender({ value: "first" });
    expect(result.current).toBe("initial");

    // Advance time past interval
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe("first");

    // Change value again immediately - should not update yet
    rerender({ value: "second" });
    expect(result.current).toBe("first");

    // Advance time again
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe("second");
  });

  it("should handle rapid consecutive changes", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 500),
      {
        initialProps: { value: "initial" },
      }
    );

    // Multiple rapid changes - should only update after each interval
    rerender({ value: "first" });
    expect(result.current).toBe("initial");

    // Advance time
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe("first");

    rerender({ value: "second" });
    expect(result.current).toBe("first");

    rerender({ value: "third" });
    expect(result.current).toBe("first");

    // Advance time again
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe("third");
  });

  it("should handle interval changes", () => {
    const { result, rerender } = renderHook(
      ({ value, interval }) => useThrottle(value, interval),
      {
        initialProps: { value: "initial", interval: 1000 },
      }
    );

    rerender({ value: "changed", interval: 1000 });
    expect(result.current).toBe("initial");

    // Advance 500ms - should not update yet
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe("initial");

    // Advance another 500ms
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe("changed");

    rerender({ value: "second", interval: 1000 });
    expect(result.current).toBe("changed");

    // Advance time again
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current).toBe("second");
  });
});

describe("useApi", () => {
  // Use real timers for useApi tests since they involve async operations
  beforeEach(() => {
    jest.useRealTimers();
  });

  afterEach(() => {
    jest.useFakeTimers();
  });

  it("should handle successful API call", async () => {
    const mockApiCall = jest
      .fn<() => Promise<string>>()
      .mockResolvedValue("success");
    const { result } = renderHook(() =>
      useApi(mockApiCall, [], { enabled: true })
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBe("success");
      expect(result.current.error).toBe(null);
    });

    expect(mockApiCall).toHaveBeenCalledTimes(1);
  });

  it("should handle API error", async () => {
    const mockError = new Error("API failed");
    const mockApiCall = jest
      .fn<() => Promise<string>>()
      .mockRejectedValue(mockError);
    const { result } = renderHook(() =>
      useApi(mockApiCall, [], { enabled: true })
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toEqual(mockError);
      expect(result.current.data).toBe(null);
    });
  });

  it("should handle retry logic", async () => {
    const mockApiCall = jest
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(new Error("First attempt failed"))
      .mockRejectedValueOnce(new Error("Second attempt failed"))
      .mockResolvedValue("success");

    const { result } = renderHook(() =>
      useApi(mockApiCall, [], { enabled: true, retry: 2, retryDelay: 100 })
    );

    expect(result.current.loading).toBe(true);

    // Wait for all retries to complete
    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
        expect(result.current.data).toBe("success");
        expect(result.current.error).toBe(null);
      },
      { timeout: 1000 }
    );

    expect(mockApiCall).toHaveBeenCalledTimes(3);
  });

  it("should debounce API calls", async () => {
    const mockApiCall = jest.fn<() => Promise<string>>().mockResolvedValue("success");

    const { result, rerender } = renderHook(
      ({ deps }) => useApi(mockApiCall, deps, { enabled: true, debounce: 100 }),
      {
        initialProps: { deps: [1] },
      }
    );

    // With debounce enabled, loading should be false initially since API call is debounced
    expect(result.current.loading).toBe(false);

    // Change dependencies quickly
    rerender({ deps: [2] });
    rerender({ deps: [3] });

    // API should not have been called yet due to debouncing
    expect(mockApiCall).not.toHaveBeenCalled();

    // Wait for debounce delay and API call to complete
    await waitFor(
      () => {
        expect(mockApiCall).toHaveBeenCalledTimes(1);
      },
      { timeout: 500 }
    );

    await waitFor(
      () => {
        expect(result.current.loading).toBe(false);
        expect(result.current.data).toBe("success");
      },
      { timeout: 500 }
    );
  });

  it("should not execute when disabled", () => {
    const mockApiCall = jest
      .fn<() => Promise<string>>()
      .mockResolvedValue("success");
    const { result } = renderHook(() =>
      useApi(mockApiCall, [], { enabled: false })
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
    expect(mockApiCall).not.toHaveBeenCalled();
  });

  it("should handle dependency changes", async () => {
    const mockApiCall = jest
      .fn<() => Promise<string>>()
      .mockResolvedValue("success");
      
    const { result, rerender } = renderHook(
      ({ deps }) => useApi(mockApiCall, deps, { enabled: true }),
      {
        initialProps: { deps: [1] },
      }
    );

    // Wait for first API call to complete
    await waitFor(() => {
      expect(result.current.data).toBe("success");
      expect(result.current.loading).toBe(false);
    });
    
    expect(mockApiCall).toHaveBeenCalledTimes(1);

    // Change dependencies - should trigger new API call
    rerender({ deps: [2] });

    await waitFor(() => {
      expect(mockApiCall).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBe("success");
    });
  });

  it("should abort previous request on new call", async () => {
    let resolveFirst: (value: string) => void;
    let resolveSecond: (value: string) => void;
    
    const firstPromise = new Promise<string>((resolve) => {
      resolveFirst = resolve;
    });
    const secondPromise = new Promise<string>((resolve) => {
      resolveSecond = resolve;
    });

    const mockApiCall = jest
      .fn<() => Promise<string>>()
      .mockReturnValueOnce(firstPromise)
      .mockReturnValueOnce(secondPromise);

    const { result, rerender } = renderHook(
      ({ deps }) => useApi(mockApiCall, deps, { enabled: true }),
      {
        initialProps: { deps: [1] },
      }
    );

    // First call should be made
    expect(mockApiCall).toHaveBeenCalledTimes(1);
    expect(result.current.loading).toBe(true);

    // Immediately change dependencies before first call completes - should abort first call
    rerender({ deps: [2] });

    // Second call should be made
    await waitFor(() => {
      expect(mockApiCall).toHaveBeenCalledTimes(2);
    });

    // Resolve first promise - but it should be ignored due to abort
    resolveFirst!("first");
    await Promise.resolve();

    // Resolve second promise
    resolveSecond!("second");

    // Wait for final state to update with second result only
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.data).toBe("second");
    });
    
    expect(mockApiCall).toHaveBeenCalledTimes(2);
  });

  it("should support manual refetch", async () => {
    const mockApiCall = jest
      .fn<() => Promise<string>>()
      .mockResolvedValue("success");
    const { result } = renderHook(() =>
      useApi(mockApiCall, [], { enabled: true })
    );

    await waitFor(() => {
      expect(result.current.data).toBe("success");
    });

    // Manual refetch
    act(() => {
      result.current.refetch();
    });

    expect(result.current.loading).toBe(true);
    expect(mockApiCall).toHaveBeenCalledTimes(2);
  });
});
