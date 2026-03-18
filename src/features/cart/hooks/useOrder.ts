"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, ApiClientError } from "@mohasinac/http";
import type { OrderDocument } from "@/db/schema";

/**
 * useOrder
 * Fetches a user's order via GET /api/user/orders/[id].
 */
export function useOrder(orderId: string | null) {
  const { data, isLoading, error } = useQuery<OrderDocument | null>({
    queryKey: ["order", orderId ?? ""],
    queryFn: async () => {
      try {
        return await apiClient.get<OrderDocument>(
          `/api/user/orders/${orderId}`,
        );
      } catch (e) {
        if (e instanceof ApiClientError && e.status === 404) return null;
        throw e;
      }
    },
    enabled: !!orderId,
  });

  return { order: data ?? null, isLoading, error };
}
