import { useEffect, useRef, useCallback, useState } from "react";
import { logError } from "@/lib/firebase-error-logger";

/**
 * Hook to prevent infinite API calls in admin pages
 *
 * Problem: useEffect with object dependencies (like `currentUser`) causes infinite re-renders
 * because objects have new references on every render, even if their values are the same.
 *
 * Solution: This hook provides a safe way to call load functions with proper dependency tracking.
 *
 * @example
 * ```tsx
 * const loadData = async () => {
 *   const data = await apiService.fetchData();
 *   setData(data);
 * };
 *
 * useSafeLoad(loadData, {
 *   enabled: !!currentUser && isAdmin,
 *   deps: [currentUser?.uid, isAdmin, filter],
 * });
 * ```
 */

interface UseSafeLoadOptions {
  /** Whether the load should execute */
  enabled?: boolean;
  /** Dependencies array - use primitive values only (strings, numbers, booleans) */
  deps?: any[];
  /** Debounce delay in milliseconds */
  debounce?: number;
  /** Skip load if already loaded (useful for initial loads) */
  skipIfLoaded?: boolean;
}

export function useSafeLoad(
  loadFn: () => Promise<void> | void,
  options: UseSafeLoadOptions = {},
) {
  const {
    enabled = true,
    deps = [],
    debounce = 0,
    skipIfLoaded = false,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

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
      logError(error as Error, { component: "useSafeLoad.safeLoad" });
      setHasLoaded(false);
      // Don't throw - let the component handle errors gracefully
    } finally {
      setIsLoading(false);
    }
  }, [enabled, loadFn, skipIfLoaded, isLoading, hasLoaded]);

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
  }, [enabled, ...deps]);

  return {
    /** Force a reload regardless of loading state */
    forceReload: useCallback(async () => {
      setHasLoaded(false);
      await safeLoad();
    }, [safeLoad]),

    /** Check if currently loading */
    isLoading,

    /** Check if has been loaded */
    hasLoaded,
  };
}

/**
 * Hook specifically for admin pages that need to check user role before loading
 *
 * @example
 * ```tsx
 * const loadUsers = async () => {
 *   const data = await usersService.list(filters);
 *   setUsers(data);
 * };
 *
 * useAdminLoad(loadUsers, {
 *   user: currentUser,
 *   requiredRole: 'admin',
 *   deps: [roleFilter, statusFilter],
 * });
 * ```
 */
interface UseAdminLoadOptions {
  user: any;
  requiredRole?: "admin" | "seller" | "user";
  deps?: any[];
  debounce?: number;
}

export function useAdminLoad(
  loadFn: () => Promise<void> | void,
  options: UseAdminLoadOptions,
) {
  const { user, requiredRole = "admin", deps = [], debounce = 0 } = options;

  const enabled = !!user?.uid && (!requiredRole || user?.role === requiredRole);

  return useSafeLoad(loadFn, {
    enabled,
    deps: [user?.uid, user?.role, ...deps],
    debounce,
  });
}
