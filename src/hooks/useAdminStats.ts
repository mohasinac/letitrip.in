"use client";
/**
 * useAdminStats Hook
 *
 * Fetch and manage admin dashboard statistics
 */

import { useApiQuery } from "./useApiQuery";
import { adminService } from "@/services";

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
  const { data, isLoading, error, refetch } = useApiQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: () => adminService.getDashboardStats(),
  });

  return {
    stats: data || null,
    isLoading,
    error: error?.message || null,
    refresh: refetch,
  };
}
