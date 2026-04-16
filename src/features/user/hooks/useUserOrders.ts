"use client";

import { useAuth } from "@/contexts/SessionContext";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/appkit/http";
import type { OrderDocument } from "@/db/schema";

interface UserOrdersResult {
  orders: OrderDocument[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * useUserOrders
 * Fetches user orders via GET /api/user/orders.
 * Only fetches when the user is authenticated.
 */
export function useUserOrders(params?: string) {
  const { user, loading } = useAuth();

  const { data, isLoading, error, refetch } = useQuery<UserOrdersResult>({
    queryKey: ["user-orders", params ?? ""],
    queryFn: async () => {
      const result = await apiClient.get<{
        orders: OrderDocument[];
        total: number;
      }>(`/api/user/orders${params ? `?${params}` : ""}`);
      return {
        orders: result.orders,
        total: result.total,
        page: 1,
        totalPages: 1,
      };
    },
    enabled: !loading && !!user,
  });

  return {
    data,
    orders: data?.orders ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 1,
    isLoading: loading || isLoading,
    error,
    refetch,
  };
}

