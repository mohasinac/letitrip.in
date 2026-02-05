"use client";
/**
 * useAdminStats Hook
 *
 * Fetch and manage admin dashboard statistics
 */

import { useState, useEffect } from "react";
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
  trips: {
    total: number;
  };
  bookings: {
    total: number;
  };
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{
        success: boolean;
        data: AdminStats;
      }>("/api/admin/dashboard");
      if (response.success) {
        setStats(response.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, error, refresh: fetchStats };
}
