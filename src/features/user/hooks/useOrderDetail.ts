"use client";

import { useApiQuery, useAuth } from "@/hooks";
import { orderService } from "@/services";
import type { OrderDocument } from "@/db/schema";

interface OrderDetailResult {
  data: OrderDocument;
}

/**
 * useOrderDetail
 * Wraps `orderService.getById(id)` for the order detail page.
 * Only fetches when the user is authenticated and `id` is available.
 */
export function useOrderDetail(id: string) {
  const { user, loading } = useAuth();

  const { data, isLoading, error, refetch } = useApiQuery<OrderDetailResult>({
    queryKey: ["user-order", id],
    queryFn: () => orderService.getById(id),
    enabled: !!user && !loading && !!id,
  });

  return {
    order: data?.data ?? null,
    isLoading: loading || isLoading,
    error,
    refetch,
  };
}
