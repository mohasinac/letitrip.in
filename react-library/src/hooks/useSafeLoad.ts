/**
 * useSafeLoad Hook
 *
 * Framework-agnostic hook to prevent infinite API calls.
 * Provides safe way to call load functions with proper dependency tracking.
 *
 * @example
 * ```tsx
 * const loadData = async () => {
 *   const data = await fetchData();
 *   setData(data);
 * };
 *
 * useSafeLoad(loadData, {
 *   enabled: !!user && isAdmin,
 *   deps: [user?.id, isAdmin, filter],
 * });
 * ```
 */

import { useCallback, useEffect, useRef, useState } from "react";

export interface UseSafeLoadOptions {
  /** Whether the load should execute */
  enabled?: boolean;
  /** Dependencies array - use primitive values only */
  deps?: any[];
  /** Debounce delay in milliseconds */
  debounce?: number;
  /** Skip load if already loaded */
  skipIfLoaded?: boolean;
  /** Error handler */
  onError?: (error: Error) => void;
}

export interface UseSafeLoadReturn {
  /** Whether currently loading */
  isLoading: boolean;
  /** Whether has loaded at least once */
  hasLoaded: boolean;
  /** Manual trigger for load */
  reload: () => Promise<void>;
  /** Reset loaded state */
  reset: () => void;
}

export function useSafeLoad(
  loadFn: () => Promise<void> | void,
  options: UseSafeLoadOptions = {}
): UseSafeLoadReturn {
  const {
    enabled = true,
    deps = [],
    debounce = 0,
    skipIfLoaded = false,
    onError,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const safeLoad = useCallback(async () => {
    // Skip if not enabled
    if (!enabled) return;

    // Skip if already loading (prevents concurrent calls)
    if (isLoading) {
      return;
    }

    // Skip if already loaded and skipIfLoaded is true
    if (skipIfLoaded && hasLoaded) {
      return;
    }

    try {
      setIsLoading(true);
      await loadFn();
      setHasLoaded(true);
    } catch (error) {
      onError?.(error as Error);
      setHasLoaded(false);
      // Don't throw - let the component handle errors gracefully
    } finally {
      setIsLoading(false);
    }
  }, [enabled, loadFn, skipIfLoaded, isLoading, hasLoaded, onError]);

  const reset = useCallback(() => {
    setHasLoaded(false);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!enabled) return;

    if (debounce > 0) {
      timeoutRef.current = setTimeout(() => {
        safeLoad();
      }, debounce);
    } else {
      safeLoad();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, debounce, ...deps]);

  return {
    isLoading,
    hasLoaded,
    reload: safeLoad,
    reset,
  };
}

export default useSafeLoad;
