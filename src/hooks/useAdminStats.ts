"use client";
/**
 * useAdminStats Hook
 *
 * Fetch and manage admin dashboard statistics
 */

import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

interface AdminStats {
  users: {
    total: number;
    active: number;
    new: number;
    newThisMonth: number;
    disabled: number;
    admins: number;
  };
  products: {
    total: number;
  };
  orders: {
    total: number;
  };
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get<{
        success: boolean;
        data: AdminStats;
      }>("/api/admin/dashboard");
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load statistics",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refresh: fetchStats };
}
