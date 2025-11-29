/**
 * Tests for useLoadingState Hook
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { useLoadingState, useMultiLoadingState } from "./useLoadingState";

describe("useLoadingState", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("initial state", () => {
    it("should have correct initial state", () => {
      const { result } = renderHook(() => useLoadingState());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.data).toBeNull();
      expect(result.current.isInitialized).toBe(false);
      expect(result.current.isRefreshing).toBe(false);
    });

    it("should accept initial data", () => {
      const initialData = { name: "test" };
      const { result } = renderHook(() =>
        useLoadingState({ initialData })
      );

      expect(result.current.data).toEqual(initialData);
    });
  });

  describe("execute", () => {
    it("should handle successful async operation", async () => {
      const { result } = renderHook(() => useLoadingState<string>());
      const mockData = "success data";

      await act(async () => {
        await result.current.execute(() => Promise.resolve(mockData));
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBe(mockData);
      expect(result.current.error).toBeNull();
      expect(result.current.isInitialized).toBe(true);
    });

    it("should set isLoading during operation", async () => {
      const { result } = renderHook(() => useLoadingState<string>());

      let resolvePromise: (value: string) => void;
      const promise = new Promise<string>((resolve) => {
        resolvePromise = resolve;
      });

      act(() => {
        result.current.execute(() => promise);
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolvePromise!("data");
        await promise;
      });

      expect(result.current.isLoading).toBe(false);
    });

    it("should handle errors", async () => {
      const { result } = renderHook(() => useLoadingState<string>());
      const errorMessage = "Test error";

      await act(async () => {
        await result.current.execute(() =>
          Promise.reject(new Error(errorMessage))
        );
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error?.message).toBe(errorMessage);
      expect(result.current.data).toBeNull();
      expect(result.current.isInitialized).toBe(true);
    });

    it("should call onLoadStart callback", async () => {
      const onLoadStart = jest.fn();
      const { result } = renderHook(() =>
        useLoadingState({ onLoadStart })
      );

      await act(async () => {
        await result.current.execute(() => Promise.resolve("data"));
      });

      expect(onLoadStart).toHaveBeenCalledTimes(1);
    });

    it("should call onLoadSuccess callback", async () => {
      const onLoadSuccess = jest.fn();
      const mockData = "success";
      const { result } = renderHook(() =>
        useLoadingState({ onLoadSuccess })
      );

      await act(async () => {
        await result.current.execute(() => Promise.resolve(mockData));
      });

      expect(onLoadSuccess).toHaveBeenCalledWith(mockData);
    });

    it("should call onLoadError callback", async () => {
      const onLoadError = jest.fn();
      const error = new Error("Test error");
      const { result } = renderHook(() =>
        useLoadingState({ onLoadError })
      );

      await act(async () => {
        await result.current.execute(() => Promise.reject(error));
      });

      expect(onLoadError).toHaveBeenCalledWith(error);
    });

    it("should set isRefreshing on subsequent loads", async () => {
      const { result } = renderHook(() => useLoadingState<string>());

      // First load
      await act(async () => {
        await result.current.execute(() => Promise.resolve("first"));
      });

      expect(result.current.isInitialized).toBe(true);

      // Second load (refresh)
      let resolveRefresh: (value: string) => void;
      const refreshPromise = new Promise<string>((resolve) => {
        resolveRefresh = resolve;
      });

      act(() => {
        result.current.execute(() => refreshPromise, { isRefresh: true });
      });

      expect(result.current.isRefreshing).toBe(true);
      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolveRefresh!("second");
        await refreshPromise;
      });

      expect(result.current.isRefreshing).toBe(false);
      expect(result.current.data).toBe("second");
    });

    it("should not set data when setData is false", async () => {
      const { result } = renderHook(() =>
        useLoadingState({ initialData: "initial" })
      );

      await act(async () => {
        await result.current.execute(() => Promise.resolve("new data"), {
          setData: false,
        });
      });

      expect(result.current.data).toBe("initial");
    });
  });

  describe("setData", () => {
    it("should update data and clear error", () => {
      const { result } = renderHook(() => useLoadingState<string>());

      act(() => {
        result.current.setError(new Error("test"));
      });

      expect(result.current.error).not.toBeNull();

      act(() => {
        result.current.setData("new data");
      });

      expect(result.current.data).toBe("new data");
      expect(result.current.error).toBeNull();
    });
  });

  describe("setError", () => {
    it("should update error", () => {
      const { result } = renderHook(() => useLoadingState());
      const error = new Error("test error");

      act(() => {
        result.current.setError(error);
      });

      expect(result.current.error).toBe(error);
    });
  });

  describe("clearError", () => {
    it("should clear error", () => {
      const { result } = renderHook(() => useLoadingState());

      act(() => {
        result.current.setError(new Error("test"));
      });

      expect(result.current.error).not.toBeNull();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe("reset", () => {
    it("should reset to initial state", async () => {
      const initialData = "initial";
      const { result } = renderHook(() =>
        useLoadingState({ initialData })
      );

      await act(async () => {
        await result.current.execute(() => Promise.resolve("new"));
      });

      expect(result.current.data).toBe("new");
      expect(result.current.isInitialized).toBe(true);

      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toBe(initialData);
      expect(result.current.isInitialized).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe("retry", () => {
    it("should retry the last operation", async () => {
      const { result } = renderHook(() => useLoadingState<string>());
      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(new Error("fail"))
        .mockResolvedValueOnce("success");

      await act(async () => {
        await result.current.execute(mockFn);
      });

      expect(result.current.error).not.toBeNull();
      expect(mockFn).toHaveBeenCalledTimes(1);

      await act(async () => {
        await result.current.retry();
      });

      expect(mockFn).toHaveBeenCalledTimes(2);
      expect(result.current.data).toBe("success");
      expect(result.current.error).toBeNull();
    });

    it("should return null if no previous operation", async () => {
      const { result } = renderHook(() => useLoadingState<string>());

      let retryResult: string | null = "not null";

      await act(async () => {
        retryResult = await result.current.retry();
      });

      expect(retryResult).toBeNull();
    });
  });

  describe("errorAutoResetMs", () => {
    it("should auto-clear error after specified time", async () => {
      const { result } = renderHook(() =>
        useLoadingState({ errorAutoResetMs: 1000 })
      );

      await act(async () => {
        await result.current.execute(() =>
          Promise.reject(new Error("test"))
        );
      });

      expect(result.current.error).not.toBeNull();

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.error).toBeNull();
    });
  });
});

describe("useMultiLoadingState", () => {
  it("should manage multiple loading states", async () => {
    const loaders = {
      users: () => Promise.resolve(["user1", "user2"]),
      orders: () => Promise.resolve(["order1"]),
    };

    const { result } = renderHook(() => useMultiLoadingState(loaders));

    expect(result.current.isAnyLoading).toBe(false);
    expect(result.current.areAllInitialized).toBe(false);

    await act(async () => {
      await result.current.executeAll();
    });

    expect(result.current.states.users.data).toEqual(["user1", "user2"]);
    expect(result.current.states.orders.data).toEqual(["order1"]);
    expect(result.current.isAnyLoading).toBe(false);
    expect(result.current.areAllInitialized).toBe(true);
    expect(result.current.hasAnyError).toBe(false);
  });

  it("should track errors across states", async () => {
    const loaders = {
      success: () => Promise.resolve("ok"),
      failure: () => Promise.reject(new Error("fail")),
    };

    const { result } = renderHook(() => useMultiLoadingState(loaders));

    await act(async () => {
      await result.current.executeAll();
    });

    expect(result.current.states.success.data).toBe("ok");
    expect(result.current.states.failure.error).not.toBeNull();
    expect(result.current.hasAnyError).toBe(true);
  });

  it("should execute single loader", async () => {
    const loaders = {
      users: jest.fn(() => Promise.resolve(["user"])),
      orders: jest.fn(() => Promise.resolve(["order"])),
    };

    const { result } = renderHook(() => useMultiLoadingState(loaders));

    await act(async () => {
      await result.current.executeOne("users");
    });

    expect(loaders.users).toHaveBeenCalledTimes(1);
    expect(loaders.orders).not.toHaveBeenCalled();
    expect(result.current.states.users.data).toEqual(["user"]);
    expect(result.current.states.orders.data).toBeNull();
  });
});
