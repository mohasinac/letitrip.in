"use client";

import { useQuery } from "@tanstack/react-query";
import { getOrderByIdAction } from "@/actions";
import type { OrderDocument } from "@/db/schema";

/**
 * useOrder
 * Wraps `orderService.getById(orderId)` for the checkout success view.
 */
export function useOrder(orderId: string | null) {
  const { data, isLoading, error } = useQuery<OrderDocument | null>({
    queryKey: ["order", orderId ?? ""],
    queryFn: () => getOrderByIdAction(orderId!),
    enabled: !!orderId,
  });

  return { order: data ?? null, isLoading, error };
}
