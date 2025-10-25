"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";

export interface UseRealTimeDataOptions {
  enabled?: boolean;
  interval?: number; // in milliseconds
  maxRetries?: number;
  onError?: (error: Error) => void;
  dependencies?: any[];
}

export interface RealTimeState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isConnected: boolean;
  retryCount: number;
}

export function useRealTimeData<T>(
  fetchFunction: () => Promise<T>,
  options: UseRealTimeDataOptions = {}
): RealTimeState<T> & {
  refresh: () => Promise<void>;
  setError: (error: string | null) => void;
} {
  const {
    enabled = true,
    interval = 30000, // 30 seconds default
    maxRetries = 3,
    onError,
    dependencies = [],
  } = options;

  const [state, setState] = useState<RealTimeState<T>>({
    data: null,
    loading: true,
    error: null,
    lastUpdated: null,
    isConnected: false,
    retryCount: 0,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);
  const { user } = useAuth();

  const fetchData = useCallback(async (isRetry = false) => {
    if (!mountedRef.current || !enabled || !user) return;

    try {
      if (!isRetry) {
        setState(prev => ({ ...prev, loading: true, error: null }));
      }

      const result = await fetchFunction();
      
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          data: result,
          loading: false,
          error: null,
          lastUpdated: new Date(),
          isConnected: true,
          retryCount: 0,
        }));
      }
    } catch (error) {
      console.error("Real-time data fetch error:", error);
      
      if (mountedRef.current) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        
        setState(prev => {
          const newRetryCount = prev.retryCount + 1;
          
          return {
            ...prev,
            loading: false,
            error: newRetryCount <= maxRetries ? null : errorMessage,
            isConnected: newRetryCount <= maxRetries,
            retryCount: newRetryCount,
          };
        });

        // Retry logic
        if (state.retryCount < maxRetries) {
          setTimeout(() => fetchData(true), Math.pow(2, state.retryCount) * 1000);
        } else {
          onError?.(error instanceof Error ? error : new Error(errorMessage));
        }
      }
    }
  }, [fetchFunction, enabled, user, maxRetries, onError, state.retryCount]);

  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, retryCount: 0 }));
    await fetchData();
  }, [fetchData]);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  // Initial fetch and setup interval
  useEffect(() => {
    if (!enabled || !user) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        isConnected: false,
        data: null 
      }));
      return;
    }

    fetchData();

    if (interval > 0) {
      intervalRef.current = setInterval(() => {
        fetchData();
      }, interval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, user, interval, ...dependencies]);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && enabled && user) {
        refresh();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [refresh, enabled, user]);

  return {
    ...state,
    refresh,
    setError,
  };
}

// Hook for managing multiple real-time data sources
export function useMultipleRealTimeData<T extends Record<string, any>>(
  sources: {
    [K in keyof T]: {
      fetchFunction: () => Promise<T[K]>;
      options?: UseRealTimeDataOptions;
    };
  }
): {
  [K in keyof T]: RealTimeState<T[K]>;
} & {
  refreshAll: () => Promise<void>;
  isAnyLoading: boolean;
  hasAnyError: boolean;
  allConnected: boolean;
} {
  const results = {} as any;
  const refreshFunctions: (() => Promise<void>)[] = [];

  for (const [key, source] of Object.entries(sources)) {
    const result = useRealTimeData(source.fetchFunction, source.options);
    results[key] = {
      data: result.data,
      loading: result.loading,
      error: result.error,
      lastUpdated: result.lastUpdated,
      isConnected: result.isConnected,
      retryCount: result.retryCount,
    };
    refreshFunctions.push(result.refresh);
  }

  const refreshAll = useCallback(async () => {
    await Promise.all(refreshFunctions.map(refresh => refresh()));
  }, [refreshFunctions]);

  const isAnyLoading = Object.values(results).some((result: any) => result.loading);
  const hasAnyError = Object.values(results).some((result: any) => result.error);
  const allConnected = Object.values(results).every((result: any) => result.isConnected);

  return {
    ...results,
    refreshAll,
    isAnyLoading,
    hasAnyError,
    allConnected,
  };
}

// Hook for real-time notifications
export function useRealTimeNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return [];

    const endpoint = user.role === "admin" 
      ? "/api/admin/notifications" 
      : "/api/seller/notifications";
    
    const response = await fetch(endpoint, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch notifications");
    }

    const data = await response.json();
    
    // Handle different response structures based on role
    if (user.role === "admin") {
      // Admin API returns { data: { notifications: [...] } }
      return data.data?.notifications || [];
    } else {
      // Seller API returns notifications array directly
      return Array.isArray(data) ? data : [];
    }
  }, [user]);

  const { data, loading, error, refresh } = useRealTimeData(
    fetchNotifications,
    {
      enabled: !!user,
      interval: 15000, // Check every 15 seconds
    }
  );

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setNotifications(data);
      // Handle different property names for read status (isRead vs read)
      setUnreadCount(data.filter((n: any) => !n.isRead && !n.read).length);
    } else if (data) {
      // If data is not an array, reset to empty array
      console.warn("Received non-array data for notifications:", data);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [data]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;

    try {
      if (user.role === "admin") {
        // Admin uses PUT to specific notification endpoint
        const endpoint = `/api/admin/notifications/${notificationId}`;
        await fetch(endpoint, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ isRead: true }),
        });
      } else {
        // Seller uses PATCH to base notifications endpoint
        const endpoint = "/api/seller/notifications";
        await fetch(endpoint, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ 
            notificationId, 
            read: true 
          }),
        });
      }

      // Update local state - handle both isRead and read properties
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, isRead: true, read: true } 
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    refresh,
    markAsRead,
  };
}

// Hook for real-time stats with caching
export function useRealTimeStats(role: "admin" | "seller") {
  const { user } = useAuth();
  const cacheRef = useRef<{ data: any; timestamp: number } | null>(null);
  const CACHE_DURATION = 60000; // 1 minute

  const fetchStats = useCallback(async () => {
    if (!user) return null;

    // Check cache first
    if (cacheRef.current) {
      const { data, timestamp } = cacheRef.current;
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }

    const endpoint = role === "admin" 
      ? "/api/admin/dashboard/stats"
      : "/api/seller/dashboard/stats";
    
    const response = await fetch(endpoint, {
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch stats");
    }

    const result = await response.json();
    const data = result.data;

    // Update cache
    cacheRef.current = {
      data,
      timestamp: Date.now(),
    };

    return data;
  }, [user, role]);

  return useRealTimeData(fetchStats, {
    enabled: !!user && (user.role === role || user.role === "admin"),
    interval: 30000, // 30 seconds
  });
}
