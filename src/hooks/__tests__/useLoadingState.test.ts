import { act, renderHook } from "@testing-library/react";
import { useLoadingState } from "../useLoadingState";

describe("useLoadingState", () => {
  it("initializes with correct default state", () => {
    const { result } = renderHook(() => useLoadingState());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();
    expect(result.current.isInitialized).toBe(false);
    expect(result.current.isRefreshing).toBe(false);
  });

  it("initializes with custom initial data", () => {
    const initialData = { id: 1, name: "Test" };
    const { result } = renderHook(() => useLoadingState({ initialData }));

    expect(result.current.data).toEqual(initialData);
    expect(result.current.isInitialized).toBe(false);
  });

  describe("execute", () => {
    it("handles successful async operation", async () => {
      const mockData = { id: 1, name: "Test" };
      const asyncFn = jest.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => useLoadingState());

      let promise: Promise<any>;
      act(() => {
        promise = result.current.execute(asyncFn);
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.error).toBeNull();

      await act(async () => {
        await promise;
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual(mockData);
      expect(result.current.error).toBeNull();
      expect(result.current.isInitialized).toBe(true);
      expect(asyncFn).toHaveBeenCalledTimes(1);
    });

    it("handles failed async operation", async () => {
      const mockError = new Error("Test error");
      const asyncFn = jest.fn().mockRejectedValue(mockError);

      const { result } = renderHook(() => useLoadingState());

      let promise: Promise<any>;
      act(() => {
        promise = result.current.execute(asyncFn);
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        await promise;
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toEqual(mockError);
      expect(result.current.data).toBeNull();
      expect(result.current.isInitialized).toBe(true);
    });

    it("sets data when setData option is true", async () => {
      const mockData = { id: 1, name: "Test" };
      const asyncFn = jest.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => useLoadingState());

      await act(async () => {
        await result.current.execute(asyncFn, { setData: true });
      });

      expect(result.current.data).toEqual(mockData);
    });

    it("does not set data when setData option is false", async () => {
      const mockData = { id: 1, name: "Test" };
      const asyncFn = jest.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => useLoadingState());

      await act(async () => {
        await result.current.execute(asyncFn, { setData: false });
      });

      expect(result.current.data).toBeNull();
    });

    it("sets isRefreshing when isRefresh option is true", async () => {
      const mockData = { id: 1, name: "Test" };
      const asyncFn = jest.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => useLoadingState());

      // First execute to initialize
      await act(async () => {
        await result.current.execute(asyncFn);
      });

      expect(result.current.isInitialized).toBe(true);
      expect(result.current.isRefreshing).toBe(false);

      // Second execute with isRefresh should set isRefreshing
      let promise: Promise<any>;
      act(() => {
        promise = result.current.execute(asyncFn, { isRefresh: true });
      });

      // During loading, isRefreshing should be true
      expect(result.current.isRefreshing).toBe(true);
      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        await promise;
      });

      // After loading completes, isRefreshing should be false
      expect(result.current.isRefreshing).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(asyncFn).toHaveBeenCalledTimes(2);
    });
  });

  describe("callbacks", () => {
    it("calls onLoadStart when loading starts", async () => {
      const onLoadStart = jest.fn();
      const asyncFn = jest.fn().mockResolvedValue("data");

      const { result } = renderHook(() => useLoadingState({ onLoadStart }));

      await act(async () => {
        await result.current.execute(asyncFn);
      });

      expect(onLoadStart).toHaveBeenCalledTimes(1);
    });

    it("calls onLoadSuccess when loading succeeds", async () => {
      const mockData = { id: 1, name: "Test" };
      const onLoadSuccess = jest.fn();
      const asyncFn = jest.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => useLoadingState({ onLoadSuccess }));

      await act(async () => {
        await result.current.execute(asyncFn);
      });

      expect(onLoadSuccess).toHaveBeenCalledWith(mockData);
      expect(onLoadSuccess).toHaveBeenCalledTimes(1);
    });

    it("calls onLoadError when loading fails", async () => {
      const mockError = new Error("Test error");
      const onLoadError = jest.fn();
      const asyncFn = jest.fn().mockRejectedValue(mockError);

      const { result } = renderHook(() => useLoadingState({ onLoadError }));

      await act(async () => {
        await result.current.execute(asyncFn);
      });

      expect(onLoadError).toHaveBeenCalledWith(mockError);
      expect(onLoadError).toHaveBeenCalledTimes(1);
    });
  });

  describe("setData", () => {
    it("updates data manually", () => {
      const { result } = renderHook(() => useLoadingState());

      const newData = { id: 1, name: "Test" };

      act(() => {
        result.current.setData(newData);
      });

      expect(result.current.data).toEqual(newData);
    });

    it("clears data when set to null", () => {
      const initialData = { id: 1, name: "Test" };
      const { result } = renderHook(() => useLoadingState({ initialData }));

      act(() => {
        result.current.setData(null);
      });

      expect(result.current.data).toBeNull();
    });
  });

  describe("setError", () => {
    it("sets error manually", () => {
      const { result } = renderHook(() => useLoadingState());

      const error = new Error("Manual error");

      act(() => {
        result.current.setError(error);
      });

      expect(result.current.error).toEqual(error);
    });
  });

  describe("clearError", () => {
    it("clears error", async () => {
      const mockError = new Error("Test error");
      const asyncFn = jest.fn().mockRejectedValue(mockError);

      const { result } = renderHook(() => useLoadingState());

      await act(async () => {
        await result.current.execute(asyncFn);
      });

      expect(result.current.error).toEqual(mockError);

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe("reset", () => {
    it("resets all state to initial values", async () => {
      const mockData = { id: 1, name: "Test" };
      const asyncFn = jest.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => useLoadingState());

      await act(async () => {
        await result.current.execute(asyncFn);
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.isInitialized).toBe(true);

      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isInitialized).toBe(false);
      expect(result.current.isRefreshing).toBe(false);
    });
  });

  describe("retry", () => {
    it("retries the last operation", async () => {
      const mockData = { id: 1, name: "Test" };
      const asyncFn = jest.fn().mockResolvedValue(mockData);

      const { result } = renderHook(() => useLoadingState());

      await act(async () => {
        await result.current.execute(asyncFn);
      });

      expect(asyncFn).toHaveBeenCalledTimes(1);

      await act(async () => {
        await result.current.retry();
      });

      expect(asyncFn).toHaveBeenCalledTimes(2);
      expect(result.current.data).toEqual(mockData);
    });

    it("returns null when no operation to retry", async () => {
      const { result } = renderHook(() => useLoadingState());

      const retryResult = await act(async () => {
        return await result.current.retry();
      });

      expect(retryResult).toBeNull();
    });
  });

  describe("error auto-reset", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("auto-resets error after specified time", async () => {
      const mockError = new Error("Test error");
      const asyncFn = jest.fn().mockRejectedValue(mockError);

      const { result } = renderHook(() =>
        useLoadingState({ errorAutoResetMs: 1000 })
      );

      await act(async () => {
        await result.current.execute(asyncFn);
      });

      expect(result.current.error).toEqual(mockError);

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(result.current.error).toBeNull();
    });
  });
});
