"use client";

/**
 * useHeaderStats Hook
 *
 * Framework-agnostic hook for fetching and managing header statistics.
 * Uses polling for real-time updates (cart count, notifications, etc).
 *
 * @example
 * ```tsx
 * const {
 *   stats,
 *   isLoading,
 *   error,
 *   refresh,
 * } = useHeaderStats({
 *   enabled: isAuthenticated,
 *   pollInterval: 30000,
 *   fetchStats: async () => {
 *     return await apiService.get('/header/stats');
 *   },
 * });
 * ```
 */

import { useCallback, useEffect, useRef, useState } from "react";

export interface HeaderStats {
  cartCount: number;
  notificationCount: number;
  messagesCount: number;
  favoritesCount: number;
  ripLimitBalance: number | null;
  hasUnpaidAuctions: boolean;
}

export interface UseHeaderStatsOptions {
  /** Whether to enable polling */
  enabled?: boolean;
  /** Poll interval in milliseconds (default: 30000) */
  pollInterval?: number;
  /** Function to fetch stats (injectable) */
  fetchStats: () => Promise<HeaderStats>;
  /** Error handler */
  onError?: (error: Error) => void;
}

export interface UseHeaderStatsReturn {
  stats: HeaderStats;
  isLoading: boolean;
  error: Error | null;
  refresh: (force?: boolean) => Promise<void>;
}

const defaultStats: HeaderStats = {
  cartCount: 0,
  notificationCount: 0,
  messagesCount: 0,
  favoritesCount: 0,
  ripLimitBalance: null,
  hasUnpaidAuctions: false,
};

export function useHeaderStats(
  options: UseHeaderStatsOptions
): UseHeaderStatsReturn {
  const { enabled = true, pollInterval = 30000, fetchStats, onError } = options;

  const [stats, setStats] = useState<HeaderStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastFetchRef = useRef<number>(0);
  const enabledRef = useRef(enabled);

  // Update ref when enabled changes
  enabledRef.current = enabled;

  const refresh = useCallback(
    async (force = false) => {
      // Debounce: don't fetch if less than 2 seconds since last fetch
      const now = Date.now();
      if (!force && now - lastFetchRef.current < 2000) {
        return;
      }
      lastFetchRef.current = now;

      if (!enabledRef.current) {
        setStats(defaultStats);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const data = await fetchStats();
        setStats(data);
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to fetch stats");
        setError(error);
        onError?.(error);
        // Keep previous stats on error
      } finally {
        setIsLoading(false);
      }
    },
    [fetchStats, onError]
  );

  // Initial fetch and setup polling
  useEffect(() => {
    if (enabled) {
      refresh(true);

      // Set up polling
      intervalRef.current = setInterval(() => {
        refresh();
      }, pollInterval);
    } else {
      setStats(defaultStats);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, pollInterval, refresh]);

  // Refresh on window focus
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleFocus = () => {
      if (enabledRef.current) {
        refresh();
      }
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [refresh]);

  return {
    stats,
    isLoading,
    error,
    refresh,
  };
}

export default useHeaderStats;
