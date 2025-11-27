/// <reference types="@testing-library/jest-dom" />

import { renderHook, act, waitFor } from "@testing-library/react";
import { useSafeLoad, useAdminLoad } from "./useSafeLoad";

// Mock timers
jest.useFakeTimers();

const mockClearTimeout = jest.spyOn(global, "clearTimeout");

describe("useSafeLoad", () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  it("calls load function when enabled", async () => {
    const loadFn = jest.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() => useSafeLoad(loadFn, { enabled: true }));

    await waitFor(() => {
      expect(loadFn).toHaveBeenCalled();
      expect(result.current.hasLoaded).toBe(true);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it("does not call load function when disabled", () => {
    const loadFn = jest.fn().mockResolvedValue(undefined);

    renderHook(() => useSafeLoad(loadFn, { enabled: false }));

    expect(loadFn).not.toHaveBeenCalled();
  });

  it("debounces load function", async () => {
    const loadFn = jest.fn().mockResolvedValue(undefined);

    renderHook(() => useSafeLoad(loadFn, { enabled: true, debounce: 1000 }));

    expect(loadFn).not.toHaveBeenCalled();

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(loadFn).toHaveBeenCalled();
    });
  });

  it("skips load if already loaded and skipIfLoaded is true", async () => {
    const loadFn = jest.fn().mockResolvedValue(undefined);

    const { rerender } = renderHook(
      ({ skipIfLoaded }) =>
        useSafeLoad(loadFn, { enabled: true, skipIfLoaded }),
      { initialProps: { skipIfLoaded: false } }
    );

    await waitFor(() => {
      expect(loadFn).toHaveBeenCalledTimes(1);
    });

    // Rerender with skipIfLoaded true
    rerender({ skipIfLoaded: true });

    // Should not call again
    expect(loadFn).toHaveBeenCalledTimes(1);
  });

  it("prevents concurrent calls", async () => {
    let resolveLoad: () => void;
    const loadPromise = new Promise<void>((resolve) => {
      resolveLoad = resolve;
    });

    const loadFn = jest.fn().mockReturnValue(loadPromise);

    const { rerender } = renderHook(() =>
      useSafeLoad(loadFn, { enabled: true, deps: [] })
    );

    // First call starts
    await waitFor(() => {
      expect(loadFn).toHaveBeenCalledTimes(1);
    });

    // Rerender with same deps - should not call again
    rerender();

    expect(loadFn).toHaveBeenCalledTimes(1);

    // Resolve the load
    act(() => {
      resolveLoad();
    });

    await waitFor(() => {
      expect(loadFn).toHaveBeenCalledTimes(1);
    });
  });

  it("handles load errors", async () => {
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const loadFn = jest.fn().mockRejectedValue(new Error("Load failed"));

    const { result } = renderHook(() => useSafeLoad(loadFn, { enabled: true }));

    await waitFor(() => {
      expect(loadFn).toHaveBeenCalled();
    });

    // Wait for error handling to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasLoaded).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(
      "[useSafeLoad] Error:",
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });

  it("forceReload resets loaded state and calls load", async () => {
    const loadFn = jest.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() => useSafeLoad(loadFn, { enabled: true }));

    // Wait for initial load to complete
    await waitFor(() => {
      expect(result.current.hasLoaded).toBe(true);
    });

    expect(loadFn).toHaveBeenCalledTimes(1);

    // Force reload
    await act(async () => {
      await result.current.forceReload();
    });

    await waitFor(() => {
      expect(loadFn).toHaveBeenCalledTimes(2);
    });
    
    expect(result.current.hasLoaded).toBe(true);
  });

  it("re-calls load when deps change", async () => {
    const loadFn = jest.fn().mockResolvedValue(undefined);

    const { rerender } = renderHook(
      ({ dep }) => useSafeLoad(loadFn, { enabled: true, deps: [dep] }),
      { initialProps: { dep: "initial" } }
    );

    await waitFor(() => {
      expect(loadFn).toHaveBeenCalledTimes(1);
    });

    // Change deps
    rerender({ dep: "changed" });

    await waitFor(() => {
      expect(loadFn).toHaveBeenCalledTimes(2);
    });
  });

  it("clears timeout on unmount", () => {
    const loadFn = jest.fn().mockResolvedValue(undefined);

    const { unmount } = renderHook(() =>
      useSafeLoad(loadFn, { enabled: true, debounce: 1000 })
    );

    unmount();

    expect(mockClearTimeout).toHaveBeenCalled();
  });
});

describe("useAdminLoad", () => {
  it("calls load when user has required role", async () => {
    const loadFn = jest.fn().mockResolvedValue(undefined);
    const user = { uid: "user1", role: "admin" };

    const { result } = renderHook(() =>
      useAdminLoad(loadFn, { user, requiredRole: "admin" })
    );

    await waitFor(() => {
      expect(loadFn).toHaveBeenCalled();
      expect(result.current.hasLoaded).toBe(true);
    });
  });

  it("does not call load when user lacks required role", () => {
    const loadFn = jest.fn().mockResolvedValue(undefined);
    const user = { uid: "user1", role: "user" };

    renderHook(() => useAdminLoad(loadFn, { user, requiredRole: "admin" }));

    expect(loadFn).not.toHaveBeenCalled();
  });

  it("does not call load when no user", () => {
    const loadFn = jest.fn().mockResolvedValue(undefined);

    renderHook(() => useAdminLoad(loadFn, { user: null }));

    expect(loadFn).not.toHaveBeenCalled();
  });

  it("includes user uid and role in deps", async () => {
    const loadFn = jest.fn().mockResolvedValue(undefined);
    const user1 = { uid: "user1", role: "admin" };
    const user2 = { uid: "user2", role: "admin" };

    const { rerender } = renderHook(
      ({ user }) => useAdminLoad(loadFn, { user, requiredRole: "admin" }),
      { initialProps: { user: user1 } }
    );

    await waitFor(() => {
      expect(loadFn).toHaveBeenCalledTimes(1);
    });

    // Change user
    rerender({ user: user2 });

    await waitFor(() => {
      expect(loadFn).toHaveBeenCalledTimes(2);
    });
  });
});
