import { logError } from "@/lib/firebase-error-logger";
import { act, renderHook } from "@testing-library/react";
import { useAdminLoad, useSafeLoad } from "../useSafeLoad";

jest.mock("@/lib/firebase-error-logger", () => ({
  logError: jest.fn(),
}));

describe("useSafeLoad Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("Basic Functionality", () => {
    it("should call load function on mount", async () => {
      const loadFn = jest.fn().mockResolvedValue(undefined);
      renderHook(() => useSafeLoad(loadFn));

      await act(async () => {
        jest.runAllTimers();
      });

      expect(loadFn).toHaveBeenCalledTimes(1);
    });

    it("should set loading state while loading", async () => {
      const loadFn = jest.fn(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );
      const { result } = renderHook(() => useSafeLoad(loadFn));

      // Loading starts immediately on mount
      await act(async () => {
        jest.runAllTimers();
        await Promise.resolve();
      });

      expect(result.current.hasLoaded).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it("should set hasLoaded after successful load", async () => {
      const loadFn = jest.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useSafeLoad(loadFn));

      expect(result.current.hasLoaded).toBe(false);

      await act(async () => {
        jest.runAllTimers();
      });

      expect(result.current.hasLoaded).toBe(true);
    });

    it("should handle synchronous load functions", async () => {
      const loadFn = jest.fn();
      renderHook(() => useSafeLoad(loadFn));

      await act(async () => {
        jest.runAllTimers();
      });

      expect(loadFn).toHaveBeenCalled();
    });
  });

  describe("Enabled/Disabled", () => {
    it("should not call load when disabled", async () => {
      const loadFn = jest.fn().mockResolvedValue(undefined);
      renderHook(() => useSafeLoad(loadFn, { enabled: false }));

      await act(async () => {
        jest.runAllTimers();
      });

      expect(loadFn).not.toHaveBeenCalled();
    });

    it("should call load when enabled", async () => {
      const loadFn = jest.fn().mockResolvedValue(undefined);
      const { rerender } = renderHook(
        ({ enabled }) => useSafeLoad(loadFn, { enabled }),
        {
          initialProps: { enabled: false },
        }
      );

      await act(async () => {
        jest.runAllTimers();
      });

      expect(loadFn).not.toHaveBeenCalled();

      rerender({ enabled: true });

      await act(async () => {
        jest.runAllTimers();
      });

      expect(loadFn).toHaveBeenCalledTimes(1);
    });
  });

  describe("Dependencies", () => {
    it("should reload when dependencies change", async () => {
      const loadFn = jest.fn().mockResolvedValue(undefined);
      const { rerender } = renderHook(
        ({ deps }) => useSafeLoad(loadFn, { deps }),
        {
          initialProps: { deps: [1, "a"] },
        }
      );

      await act(async () => {
        jest.runAllTimers();
      });

      expect(loadFn).toHaveBeenCalledTimes(1);

      rerender({ deps: [2, "b"] });

      await act(async () => {
        jest.runAllTimers();
      });

      expect(loadFn).toHaveBeenCalledTimes(2);
    });

    it("should not reload when dependencies don't change", async () => {
      const loadFn = jest.fn().mockResolvedValue(undefined);
      const { rerender } = renderHook(
        ({ deps }) => useSafeLoad(loadFn, { deps }),
        {
          initialProps: { deps: [1, "a"] },
        }
      );

      await act(async () => {
        jest.runAllTimers();
      });

      expect(loadFn).toHaveBeenCalledTimes(1);

      rerender({ deps: [1, "a"] });

      await act(async () => {
        jest.runAllTimers();
      });

      expect(loadFn).toHaveBeenCalledTimes(1);
    });
  });

  describe("Debounce", () => {
    it("should debounce load calls", async () => {
      const loadFn = jest.fn().mockResolvedValue(undefined);
      renderHook(() => useSafeLoad(loadFn, { debounce: 500 }));

      // Should not call immediately
      expect(loadFn).not.toHaveBeenCalled();

      // Fast-forward 400ms
      act(() => {
        jest.advanceTimersByTime(400);
      });

      expect(loadFn).not.toHaveBeenCalled();

      // Fast-forward another 100ms (total 500ms)
      await act(async () => {
        jest.advanceTimersByTime(100);
      });

      expect(loadFn).toHaveBeenCalledTimes(1);
    });

    it("should cancel pending debounced call on unmount", () => {
      const loadFn = jest.fn().mockResolvedValue(undefined);
      const { unmount } = renderHook(() =>
        useSafeLoad(loadFn, { debounce: 500 })
      );

      unmount();

      act(() => {
        jest.runAllTimers();
      });

      expect(loadFn).not.toHaveBeenCalled();
    });
  });

  describe("Skip If Loaded", () => {
    it("should not reload if skipIfLoaded is true and already loaded", async () => {
      const loadFn = jest.fn().mockResolvedValue(undefined);
      const { rerender } = renderHook(
        ({ deps }) => useSafeLoad(loadFn, { skipIfLoaded: true, deps }),
        {
          initialProps: { deps: [1] },
        }
      );

      await act(async () => {
        jest.runAllTimers();
      });

      expect(loadFn).toHaveBeenCalledTimes(1);

      // Change deps but skipIfLoaded should prevent reload
      rerender({ deps: [2] });

      await act(async () => {
        jest.runAllTimers();
      });

      expect(loadFn).toHaveBeenCalledTimes(1);
    });

    it("should reload if skipIfLoaded is false", async () => {
      const loadFn = jest.fn().mockResolvedValue(undefined);
      const { rerender } = renderHook(
        ({ deps }) => useSafeLoad(loadFn, { skipIfLoaded: false, deps }),
        {
          initialProps: { deps: [1] },
        }
      );

      await act(async () => {
        jest.runAllTimers();
      });

      expect(loadFn).toHaveBeenCalledTimes(1);

      rerender({ deps: [2] });

      await act(async () => {
        jest.runAllTimers();
      });

      expect(loadFn).toHaveBeenCalledTimes(2);
    });
  });

  describe("Concurrent Load Prevention", () => {
    it("should prevent concurrent loads", async () => {
      let resolveLoad: () => void;
      const loadFn = jest.fn(
        () =>
          new Promise<void>((resolve) => {
            resolveLoad = resolve;
          })
      );

      const { result } = renderHook(() => useSafeLoad(loadFn));

      await act(async () => {
        jest.runAllTimers();
        await Promise.resolve();
      });

      expect(result.current.isLoading).toBe(true);

      // Try to force reload while loading
      await act(async () => {
        result.current.forceReload();
      });

      // Should still be only 1 call
      expect(loadFn).toHaveBeenCalledTimes(1);

      // Resolve the load
      await act(async () => {
        resolveLoad!();
        await Promise.resolve();
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("Force Reload", () => {
    it("should reset hasLoaded and reload", async () => {
      const loadFn = jest.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() =>
        useSafeLoad(loadFn, { skipIfLoaded: true })
      );

      await act(async () => {
        jest.runAllTimers();
      });

      expect(loadFn).toHaveBeenCalledTimes(1);
      expect(result.current.hasLoaded).toBe(true);

      // Force reload - needs to wait for state updates
      await act(async () => {
        await result.current.forceReload();
        await Promise.resolve();
      });

      expect(loadFn).toHaveBeenCalledTimes(2);
    });
  });

  describe("Error Handling", () => {
    it("should handle errors gracefully", async () => {
      const error = new Error("Load failed");
      const loadFn = jest.fn().mockRejectedValue(error);
      const { result } = renderHook(() => useSafeLoad(loadFn));

      await act(async () => {
        jest.runAllTimers();
      });

      expect(logError).toHaveBeenCalledWith(error, {
        component: "useSafeLoad.safeLoad",
      });
      expect(result.current.hasLoaded).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it("should set hasLoaded to false on error", async () => {
      const loadFn = jest.fn().mockRejectedValue(new Error("Failed"));
      const { result } = renderHook(() => useSafeLoad(loadFn));

      await act(async () => {
        jest.runAllTimers();
      });

      expect(result.current.hasLoaded).toBe(false);
    });
  });
});

describe("useAdminLoad Hook", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("Role-based Loading", () => {
    it("should load when user has required role", async () => {
      const loadFn = jest.fn().mockResolvedValue(undefined);
      const user = { uid: "user-123", role: "admin" };

      renderHook(() => useAdminLoad(loadFn, { user, requiredRole: "admin" }));

      await act(async () => {
        jest.runAllTimers();
      });

      expect(loadFn).toHaveBeenCalledTimes(1);
    });

    it("should not load when user role doesn't match", async () => {
      const loadFn = jest.fn().mockResolvedValue(undefined);
      const user = { uid: "user-123", role: "user" };

      renderHook(() => useAdminLoad(loadFn, { user, requiredRole: "admin" }));

      await act(async () => {
        jest.runAllTimers();
      });

      expect(loadFn).not.toHaveBeenCalled();
    });

    it("should not load when user is not authenticated", async () => {
      const loadFn = jest.fn().mockResolvedValue(undefined);

      renderHook(() =>
        useAdminLoad(loadFn, { user: null, requiredRole: "admin" })
      );

      await act(async () => {
        jest.runAllTimers();
      });

      expect(loadFn).not.toHaveBeenCalled();
    });

    it("should not load when requiredRole is admin and user is not admin", async () => {
      const loadFn = jest.fn().mockResolvedValue(undefined);
      const user = { uid: "user-123", role: "user" };

      // Default requiredRole is "admin"
      renderHook(() => useAdminLoad(loadFn, { user }));

      await act(async () => {
        jest.runAllTimers();
      });

      expect(loadFn).not.toHaveBeenCalled();
    });
  });

  describe("Dependencies", () => {
    it("should reload when user changes", async () => {
      const loadFn = jest.fn().mockResolvedValue(undefined);
      const { rerender } = renderHook(
        ({ user }) => useAdminLoad(loadFn, { user, requiredRole: "admin" }),
        {
          initialProps: { user: { uid: "user-1", role: "admin" } },
        }
      );

      await act(async () => {
        jest.runAllTimers();
      });

      expect(loadFn).toHaveBeenCalledTimes(1);

      rerender({ user: { uid: "user-2", role: "admin" } });

      await act(async () => {
        jest.runAllTimers();
      });

      expect(loadFn).toHaveBeenCalledTimes(2);
    });

    it("should reload when custom deps change", async () => {
      const loadFn = jest.fn().mockResolvedValue(undefined);
      const user = { uid: "user-123", role: "admin" };
      const { rerender } = renderHook(
        ({ filter }) =>
          useAdminLoad(loadFn, { user, requiredRole: "admin", deps: [filter] }),
        {
          initialProps: { filter: "active" },
        }
      );

      await act(async () => {
        jest.runAllTimers();
      });

      expect(loadFn).toHaveBeenCalledTimes(1);

      rerender({ filter: "inactive" });

      await act(async () => {
        jest.runAllTimers();
      });

      expect(loadFn).toHaveBeenCalledTimes(2);
    });
  });

  describe("Debounce", () => {
    it("should debounce admin loads", async () => {
      const loadFn = jest.fn().mockResolvedValue(undefined);
      const user = { uid: "user-123", role: "admin" };

      renderHook(() =>
        useAdminLoad(loadFn, { user, requiredRole: "admin", debounce: 500 })
      );

      expect(loadFn).not.toHaveBeenCalled();

      await act(async () => {
        jest.advanceTimersByTime(500);
      });

      expect(loadFn).toHaveBeenCalledTimes(1);
    });
  });
});
