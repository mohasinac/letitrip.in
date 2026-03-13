"use client";

/**
 * useAdminStats
 *
 * Fetch admin dashboard statistics.
 * Moved from src/hooks/useAdminStats.ts — admin-only, belongs in features/admin.
 */

import { useQuery } from "@tanstack/react-query";
import { getAdminDashboardStatsAction } from "@/actions";

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
  const { data, isLoading, error, refetch } = useQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: () => getAdminDashboardStatsAction(),
  });

  return {
    stats: data ?? null,
    isLoading,
    error: error?.message ?? null,
    refresh: () => {
      void refetch();
    },
  };
}
