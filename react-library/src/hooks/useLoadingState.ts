/**
 * useLoadingState Hook
 * Consolidates common loading/error state patterns across components
 *
 * Part of E030: Code Quality & SonarCloud Integration
 */

import { useCallback, useRef, useState } from "react";

export interface LoadingState<T = any, E = Error> {
  /** Whether data is currently loading */
  isLoading: boolean;
  /** Error if loading failed */
  error: E | null;
  /** The loaded data */
  data: T | null;
  /** Whether initial load has completed (success or error) */
  isInitialized: boolean;
  /** Whether data is being refreshed (not initial load) */
  isRefreshing: boolean;
}

export interface UseLoadingStateOptions<T> {
  /** Initial data value */
  initialData?: T | null;
  /** Called when loading starts */
  onLoadStart?: () => void;
  /** Called when loading completes successfully */
  onLoadSuccess?: (data: T) => void;
  /** Called when loading fails */
  onLoadError?: (error: Error) => void;
  /** Reset error after this many milliseconds */
  errorAutoResetMs?: number;
}

export interface UseLoadingStateReturn<T> extends LoadingState<T> {
  /** Execute an async operation with loading state management */
  execute: <R = T>(
    asyncFn: () => Promise<R>,
    options?: { setData?: boolean; isRefresh?: boolean }
  ) => Promise<R | null>;
  /** Set data manually */
  setData: (data: T | null) => void;
  /** Set error manually */
  setError: (error: Error | null) => void;
  /** Reset all state */
  reset: () => void;
  /** Clear error */
  clearError: () => void;
  /** Retry the last operation */
  retry: () => Promise<T | null>;
}

/**
 * Hook for managing loading, error, and data states
 *
 * @example
 * ```tsx
 * const { data, isLoading, error, execute } = useLoadingState<User[]>();
 *
 * useEffect(() => {
 *   execute(() => userService.getUsers());
 * }, []);
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <ErrorMessage error={error} />;
 * return <UserList users={data} />;
 * ```
 *
 * @example
 * // With retry capability
 * ```tsx
 * const { data, isLoading, error, execute, retry } = useLoadingState<Order>();
 *
 * const loadOrder = useCallback(async () => {
 *   await execute(() => orderService.getOrder(orderId));
 * }, [orderId]);
 *
 * useEffect(() => { loadOrder(); }, [loadOrder]);
 *
 * if (error) {
 *   return (
 *     <div>
 *       <p>Failed to load order: {error.message}</p>
 *       <button onClick={retry}>Retry</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useLoadingState<T = any>(
  options: UseLoadingStateOptions<T> = {}
): UseLoadingStateReturn<T> {
  const {
    initialData = null,
    onLoadStart,
    onLoadSuccess,
    onLoadError,
    errorAutoResetMs,
  } = options;

  const [state, setState] = useState<LoadingState<T>>({
    isLoading: false,
    error: null,
    data: initialData,
    isInitialized: false,
    isRefreshing: false,
  });

  const lastOperationRef = useRef<(() => Promise<T>) | null>(null);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Use refs to avoid recreating execute callback when handlers change
  const onLoadStartRef = useRef(onLoadStart);
  const onLoadSuccessRef = useRef(onLoadSuccess);
  const onLoadErrorRef = useRef(onLoadError);

  // Update refs when handlers change
  onLoadStartRef.current = onLoadStart;
  onLoadSuccessRef.current = onLoadSuccess;
  onLoadErrorRef.current = onLoadError;

  const clearErrorTimeout = useCallback(() => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
  }, []);

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({ ...prev, data, error: null }));
  }, []);

  const setError = useCallback(
    (error: Error | null) => {
      clearErrorTimeout();

      setState((prev) => ({ ...prev, error }));

      if (error && errorAutoResetMs) {
        errorTimeoutRef.current = setTimeout(() => {
          setState((prev) => ({ ...prev, error: null }));
        }, errorAutoResetMs);
      }
    },
    [errorAutoResetMs, clearErrorTimeout]
  );

  const clearError = useCallback(() => {
    clearErrorTimeout();
    setState((prev) => ({ ...prev, error: null }));
  }, [clearErrorTimeout]);

  const reset = useCallback(() => {
    clearErrorTimeout();
    setState({
      isLoading: false,
      error: null,
      data: initialData,
      isInitialized: false,
      isRefreshing: false,
    });
    lastOperationRef.current = null;
  }, [initialData, clearErrorTimeout]);

  const execute = useCallback(
    async <R = T>(
      asyncFn: () => Promise<R>,
      executeOptions: { setData?: boolean; isRefresh?: boolean } = {}
    ): Promise<R | null> => {
      const { setData: shouldSetData = true, isRefresh = false } =
        executeOptions;

      clearErrorTimeout();
      onLoadStartRef.current?.();

      // Store for retry
      lastOperationRef.current = asyncFn as any;

      setState((prev) => ({
        ...prev,
        isLoading: true,
        error: null,
        isRefreshing: isRefresh && prev.isInitialized,
      }));

      try {
        const result = await asyncFn();

        setState((prev) => ({
          ...prev,
          isLoading: false,
          isInitialized: true,
          isRefreshing: false,
          ...(shouldSetData && { data: result as T }),
        }));

        if (shouldSetData) {
          onLoadSuccessRef.current?.(result as T);
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));

        setState((prev) => ({
          ...prev,
          isLoading: false,
          error,
          isInitialized: true,
          isRefreshing: false,
        }));

        onLoadErrorRef.current?.(error);

        if (errorAutoResetMs) {
          errorTimeoutRef.current = setTimeout(() => {
            setState((prev) => ({ ...prev, error: null }));
          }, errorAutoResetMs);
        }

        return null;
      }
    },
    [errorAutoResetMs, clearErrorTimeout]
  );

  const retry = useCallback(async (): Promise<T | null> => {
    if (lastOperationRef.current) {
      return execute(lastOperationRef.current);
    }
    return null;
  }, [execute]);

  return {
    ...state,
    execute,
    setData,
    setError,
    reset,
    clearError,
    retry,
  };
}

/**
 * Hook for managing multiple loading states
 * Useful when a component needs to load multiple independent resources
 *
 * @example
 * ```tsx
 * const { states, executeAll, isAnyLoading, hasAnyError } = useMultiLoadingState({
 *   users: () => userService.getUsers(),
 *   orders: () => orderService.getOrders(),
 *   stats: () => statsService.getDashboardStats(),
 * });
 *
 * if (isAnyLoading) return <Spinner />;
 * if (hasAnyError) return <ErrorMessage errors={Object.values(states).map(s => s.error).filter(Boolean)} />;
 *
 * return (
 *   <Dashboard
 *     users={states.users.data}
 *     orders={states.orders.data}
 *     stats={states.stats.data}
 *   />
 * );
 * ```
 */
export function useMultiLoadingState<
  T extends Record<string, () => Promise<any>>
>(loaders: T) {
  const keys = Object.keys(loaders) as (keyof T)[];

  // Create individual loading states
  const states = keys.reduce((acc, key) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    acc[key] = useLoadingState();
    return acc;
  }, {} as { [K in keyof T]: UseLoadingStateReturn<Awaited<ReturnType<T[K]>>> });

  // Execute all loaders
  const executeAll = useCallback(async () => {
    const promises = keys.map((key) => states[key].execute(loaders[key]));
    await Promise.all(promises);
  }, [keys, states, loaders]);

  // Execute a specific loader
  const executeOne = useCallback(
    async <K extends keyof T>(key: K) => {
      await states[key].execute(loaders[key]);
    },
    [states, loaders]
  );

  // Computed states
  const isAnyLoading = keys.some((key) => states[key].isLoading);
  const isAllLoading = keys.every((key) => states[key].isLoading);
  const hasAnyError = keys.some((key) => states[key].error !== null);
  const areAllInitialized = keys.every((key) => states[key].isInitialized);

  return {
    states,
    executeAll,
    executeOne,
    isAnyLoading,
    isAllLoading,
    hasAnyError,
    areAllInitialized,
  };
}

export default useLoadingState;
