"use client";
/**
 * useAdminStats Hook
 *
 * Fetch and manage admin dashboard statistics
 */

import { useApiQuery } from "./useApiQuery";
import { API_ENDPOINTS, ERROR_MESSAGES } from "@/constants";
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
  const { data, isLoading, error, refetch } = useApiQuery<AdminStats>({
    queryKey: ["admin-stats"],
    queryFn: () => apiClient.get<AdminStats>(API_ENDPOINTS.ADMIN.DASHBOARD),
  });

  return {
    stats: data || null,
    isLoading,
    error: error?.message || null,
    refresh: refetch,
  };
}
