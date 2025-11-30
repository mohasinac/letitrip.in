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

interface HeaderStats {
  cartCount: number;
  notificationCount: number;
  messagesCount: number;
  favoritesCount: number;
  ripLimitBalance: number | null;
  hasUnpaidAuctions: boolean;
}

const defaultStats: HeaderStats = {
  cartCount: 0,
  notificationCount: 0,
  messagesCount: 0,
  favoritesCount: 0,
  ripLimitBalance: null,
  hasUnpaidAuctions: false,
};

const POLL_INTERVAL = 30000; // 30 seconds

export function useHeaderStats() {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState<HeaderStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchRef = useRef<number>(0);

  const fetchStats = useCallback(async (force = false) => {
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
        success: boolean;
        data: HeaderStats;
      }>("/header/stats");
      
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch stats"));
      // Keep previous stats on error
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

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
      notificationCount: Math.max(0, current.notificationCount - count),
    }));
  }, []);

  const decrementMessages = useCallback((count = 1) => {
    setStats((current) => ({
      ...current,
      messagesCount: Math.max(0, current.messagesCount - count),
    }));
  }, []);

  return {
    // Stats values
    cartCount: stats.cartCount,
    notificationCount: stats.notificationCount,
    messagesCount: stats.messagesCount,
    favoritesCount: stats.favoritesCount,
    ripLimitBalance: stats.ripLimitBalance,
    hasUnpaidAuctions: stats.hasUnpaidAuctions,

    // Total badge count for notification bell
    totalNotifications: stats.notificationCount + stats.messagesCount,

    // Loading and error states
    isLoading,
    error,

    // Refresh function to manually refetch stats
    refresh: () => fetchStats(true),

    // Optimistic update functions
    updateCartCount,
    decrementNotifications,
    decrementMessages,
  };
}

export type { HeaderStats };
