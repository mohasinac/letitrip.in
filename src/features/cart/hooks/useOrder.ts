"use client";

import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/services";
import type { OrderDocument } from "@/db/schema";

/**
 * useOrder
 * Wraps `orderService.getById(orderId)` for the checkout success view.
 */
export function useOrder(orderId: string | null) {
  const { data, isLoading, error } = useQuery<{ data: OrderDocument }>({
    queryKey: ["order", orderId ?? ""],
    queryFn: () => orderService.getById(orderId!),
    enabled: !!orderId,
  });

  return { order: data?.data ?? null, isLoading, error };
}
