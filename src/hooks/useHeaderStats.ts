/**
 * @fileoverview TypeScript Module
 * @module src/hooks/useHeaderStats
 * @description This file contains functionality related to useHeaderStats
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * useHeaderStats Hook
 * Epic: E033 - Live Header Data
 *
 * Hook to fetch and manage header statistics (cart count, notifications, messages, etc.)
 * Uses polling for real-time updates.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api.service";

/**
 * HeaderStats interface
 * 
 * @interface
 * @description Defines the structure and contract for HeaderStats
 */
interface HeaderStats {
  /** Cart Count */
  cartCount: number;
  /** Notification Count */
  notificationCount: number;
  /** Messages Count */
  messagesCount: number;
  /** Favorites Count */
  favoritesCount: number;
  /** Rip Limit Balance */
  ripLimitBalance: number | null;
  /** Has Unpaid Auctions */
  hasUnpaidAuctions: boolean;
}

const defaultStats: HeaderStats = {
  /** Cart Count */
  cartCount: 0,
  /** Notification Count */
  notificationCount: 0,
  /** Messages Count */
  messagesCount: 0,
  /** Favorites Count */
  favoritesCount: 0,
  /** Rip Limit Balance */
  ripLimitBalance: null,
  /** Has Unpaid Auctions */
  hasUnpaidAuctions: false,
};

const POLL_INTERVAL = 30000; // 30 seconds

/**
 * Function: Use Header Stats
 */
/**
 * Custom React hook for header stats
 *
 * @returns {any} The useheaderstats result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * useHeaderStats();
 */

/**
 * Custom React hook for header stats
 *
 * @returns {any} The useheaderstats result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * useHeaderStats();
 */

export function useHeaderStats() {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState<HeaderStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<number>(0);

  const fetchStats = useCallback(
    async (force = false) => {
      // Debounce: don't fetch if less than 2 seconds since last fetch
      const now = Date.now();
      if (!force && now - lastFetchRef.current < 2000) {
        return;
      }
      lastFetchRef.current = now;

      if (!isAuthenticated) {
        setStats(defaultStats);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const response = await apiService.get<{
          /** Success */
          success: boolean;
          /** Data */
          data: HeaderStats;
        }>("/header/stats");

        if (response.success) {
          setStats(response.data);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to fetch stats"),
        );
        // Keep previous stats on error
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated],
  );

  // Initial fetch and setup polling
  useEffect(() => {
    if (isAuthenticated) {
      fetchStats(true);

      // Set up polling
      intervalRef.current = setInterval(() => {
        fetchStats();
      }, POLL_INTERVAL);
    } else {
      setStats(defaultStats);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAuthenticated, fetchStats]);

  // Refresh on focus
  useEffect(() => {
    /**
     * Handles focus event
     *
     * @returns {any} The handlefocus result
     */

    /**
     * Handles focus event
     *
     * @returns {any} The handlefocus result
     */

    const handleFocus = () => {
      if (isAuthenticated) {
        fetchStats();
      }
    };

    globalThis.addEventListener?.("focus", handleFocus);
    return () => globalThis.removeEventListener?.("focus", handleFocus);
  }, [isAuthenticated, fetchStats]);

  // Optimistic update functions
  const updateCartCount = useCallback((count: number) => {
    setStats((current) => ({ ...current, cartCount: count }));
  }, []);

  const decrementNotifications = useCallback((count = 1) => {
    setStats((current) => ({
      ...current,
      /** Notification Count */
      notificationCount: Math.max(0, current.notificationCount - count),
    }));
  }, []);

  const decrementMessages = useCallback((count = 1) => {
    setStats((current) => ({
      ...current,
      /** Messages Count */
      messagesCount: Math.max(0, current.messagesCount - count),
    }));
  }, []);

  return {
    // Stats values
    /** Cart Count */
    cartCount: stats.cartCount,
    /** Notification Count */
    notificationCount: stats.notificationCount,
    /** Messages Count */
    messagesCount: stats.messagesCount,
    /** Favorites Count */
    favoritesCount: stats.favoritesCount,
    /** Rip Limit Balance */
    ripLimitBalance: stats.ripLimitBalance,
    /** Has Unpaid Auctions */
    hasUnpaidAuctions: stats.hasUnpaidAuctions,

    // Total badge count for notification bell
    /** Total Notifications */
    totalNotifications: stats.notificationCount + stats.messagesCount,

    // Loading and error states
    isLoading,
    error,

    // Refresh function to manually refetch stats
    /** Refresh */
    refresh: () => fetchStats(true),

    // Optimistic update functions
    updateCartCount,
    decrementNotifications,
    decrementMessages,
  };
}

export type { HeaderStats };
