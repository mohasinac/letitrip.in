"use client";

import { useAuth } from "@/hooks";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/appkit/http";
import type { OrderDocument } from "@/db/schema";

/**
 * useOrderDetail
 * Fetches an order via GET /api/user/orders/[id].
 * Only fetches when the user is authenticated and `id` is available.
 */
export function useOrderDetail(id: string) {
  const { user, loading } = useAuth();

  const { data, isLoading, error, refetch } = useQuery<OrderDocument | null>({
    queryKey: ["user-order", id],
    queryFn: () => apiClient.get<OrderDocument>(`/api/user/orders/${id}`),
    enabled: !!user && !loading && !!id,
  });

  return {
    order: data ?? null,
    isLoading: loading || isLoading,
    error,
    refetch,
  };
}

