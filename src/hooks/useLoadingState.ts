/**
 * @fileoverview TypeScript Module
 * @module src/hooks/useLoadingState
 * @description This file contains functionality related to useLoadingState
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * useLoadingState Hook
 * Consolidates common loading/error state patterns across components
 *
 * Part of E030: Code Quality & SonarCloud Integration
 */

import { useCallback, useRef, useState } from "react";

/**
 * LoadingState interface
 * 
 * @interface
 * @description Defines the structure and contract for LoadingState
 */
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

/**
 * UseLoadingStateOptions interface
 * 
 * @interface
 * @description Defines the structure and contract for UseLoadingStateOptions
 */
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

/**
 * UseLoadingStateReturn interface
 * 
 * @interface
 * @description Defines the structure and contract for UseLoadingStateReturn
 */
export interface UseLoadingStateReturn<T> extends LoadingState<T> {
  /** Execute an async operation with loading state management */
  execute: <R = T>(
    /** Async Fn */
    asyncFn: () => Promise<R>,
    /** Options */
    options?: { setData?: boolean; isRefresh?: boolean },
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
 * /**
 * Performs load order operation
 *
 * @param {any} async( - The async(
 *
 * @returns {Promise<any>} The loadorder result
 *
 */
const loadOrder = useCallback(async () => {
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
/**
 * Custom React hook for loading state
 *
 * @param {UseLoadingStateOptions<T>} [options] - Configuration options
 *
 * @returns {any} The useloadingstate result
 *
 * @example
 * useLoadingState(options);
 */

/**
 * Custom React hook for loading state
 *
 * @param {UseLoadingStateOptions<T>} [/** Options */
  options] - The /**  options */
  options
 *
 * @returns {any} The useloadingstate result
 *
 * @example
 * useLoadingState(/** Options */
  options);
 */

/**
 * Custom React hook for loading state
 *
 * @param {UseLoadingStateOptions<T>} [options] - The options
 *
 * @returns {UseLoadingStateReturn<T>} The useloadingstate result
 *
 * @example
 * useLoadingState(options);
 */
export function useLoadingState<T = any>(
  /** Options */
  options: UseLoadingStateOptions<T> = {},
): UseLoadingStateReturn<T> {
  const {
    initialData = null,
    onLoadStart,
    onLoadSuccess,
    onLoadError,
    errorAutoResetMs,
  } = options;

  const [state, setState] = useState<LoadingState<T>>({
    /** Is Loading */
    isLoading: false,
    /** Error */
    error: null,
    /** Data */
    d/**
 * Performs last operation ref operation
 *
 * @param {any} ( - The (
 *
 * @returns {any} The lastoperationref result
 *
 */
ata: initialData,
    /** Is Initialized */
    isInitialized: false,
    /** Is Refreshing */
    isRefreshing: false,
  });

  const lastOperationRef = useRef<(() => Promise<T>) | null>(nu/**
 * Sets data
 *
 * @param {T | null} (data - The (data
 *
 * @returns {any} The setdata result
 *
 */
ll);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearErrorTimeout = useCallback(() => {
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
  }, []);

  const setData = useCallback((data: T | null) => {
    setState((prev) => ({ ...prev, data, error: null }));
  }, []);

  const setError = useCallback(/**
 * Performs clear error operation
 *
 * @param {any} ( - The (
 *
 * @returns {any} The clearerror result
 *
 */

    (error: Error | null) => {
      clearErrorTimeout();

      setState((prev) => ({ ...prev, error }));

      if (error && errorAutoResetMs) {
        errorTimeoutRef.current = setTimeout(() => {
          setState((prev) => ({ ...prev, error: null }));
        }, errorAutoResetMs);
      }
    },
    [errorAutoResetMs, clearErrorTimeout],
  );

  const clearError = useCallback(() => {
    clearErrorTimeout();
    setState((prev) => ({ ...prev, error: null }));
  }, [clearErrorTimeout]);

  const reset = useCallback(() => {
    clearErrorTimeout();
    setState({
      /** Is Loading */
      isLoading: false,
      /** Error */
      error: null,
      /** Data */
      data: initialData,
      /** Is Initialized */
      isInitialized: false,
      /** Is Refreshing */
      isRefreshing: false,
    });
    lastOperationRef.current = null;
  }, [initialData, clearErrorTimeout]);

  const execute = useCallback(
    async <R = T>(
      /** Async Fn */
      asyncFn: () => Promise<R>,
      /** Execute Options */
      executeOptions: { setData?: boolean; isRefresh?: boolean } = {},
    ): Promise<R | null> => {
  /**
 * Performs result operation
 *
 * @returns {Promise<any>} The result result
 *
 */
    const { setData: shouldSetData = true, isRefresh = false } =
        executeOptions;

      clearErrorTimeout();
      onLoadStart?.();

      // Store for retry
      lastOperationRef.current = asyncFn as any;

      setState((prev) => ({
        ...prev,
        /** Is Loading */
        isLoading: true,
        /** Error */
        error: null,
        /** Is Refreshing /**
 * Performs error operation
 *
 * @param {any} String(err - The string(err
 *
 * @returns {any} The error result
 *
 */
*/
        isRefreshing: isRefresh && prev.isInitialized,
      }));

      try {
        const result = await asyncFn();

        setState((prev) => ({
          ...prev,
          /** Is Loading */
          isLoading: false,
          /** Is Initialized */
          isInitialized: true,
          /** Is Refreshing */
          isRefreshing: false,
          ...(shouldSetData && { data: result as T }),
        }));

        if (shouldSetData) {
          onLoadSuccess?.(result as T);
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new/**
 * Performs retry operation
 *
 * @param {any} async( - The async(
 *
 * @returns {Promise<T | null> =>} The retry result
 *
 */
 Error(String(err));

        setState((prev) => ({
          ...prev,
          /** Is Loading */
          isLoading: false,
          error,
          /** Is Initialized */
          isInitialized: true,
          /** Is Refreshing */
          isRefreshing: false,
        }));

        onLoadError?.(error);

        if (errorAutoResetMs) {
          errorTimeoutRef.current = setTimeout(() => {
            setState((prev) => ({ ...prev, error: null }));
          }, errorAutoResetMs);
        }

        return null;
      }
    },
    [
      onLoadStart,
      onLoadSuccess,
      onLoadError,
      errorAutoResetMs,
      clearErrorTimeout,
    ],
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
 *   stats: () => statsService.getDashboardStats(),/**
 * Performs states operation
 *
 * @param {any} (acc - The (acc
 * @param {any} key - The key
 *
 * @returns {any} The states result
 *
 */

 * });
 *
 * if (isAnyLoading) return <Spinner />;
 * if (hasAnyError) return <ErrorMessage errors={Object.values(states).map(s => s.error).filte/**
 * Performs execute all operation
 *
 * @param {any} async( - The async(
 *
 * @returns {Promise<any>} The executeall result
 *
 */
r(Boolean)} />;
 *
 * return (
 *   <Dashboard
 *     users={states.users.data}
 * /**
 * Performs execute one operation
 *
 * @param {K} async<KextendskeyofT>(key - The async<kextendskeyoft>(key
 *
 * @returns {Promise<any>} The executeone result
 *
 */
    orders={states.orders.data}
 *     stats={states.stats.data}
 *   />
 * );
 /**
 * Checks if all loading
 *
 * @param {any} (key - The (key
 *
 * @returns {any} The isallloading result
 *
 */
* ```
 */
/**
 * Custom React hook for multi loading state
 *
 * @returns {any} The usemultiloadingstate result
 *
 * @example
 * useMultiLoadingState();
 */

/**
 * Custom React hook for multi loading state
 *
 * @returns {any} The usemultiloadingstate result
 *
 * @example
 * useMultiLoadingState();
 */

export function useMultiLoadingState<
  T extends Record<string, () => Promise<any>>,
>(loaders: T) {
  const keys = Object.keys(loaders) as (keyof T)[];

  // Create individual loading states
  const states = keys.reduce(
    (acc, key) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      acc[key] = useLoadingState();
      return acc;
    },
    {} as { [K in keyof T]: UseLoadingStateReturn<Awaited<ReturnType<T[K]>>> },
  );

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
    [states, loaders],
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
