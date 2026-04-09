"use client";

import { useOrder as useCartOrder } from "@mohasinac/appkit/features/cart";
import type { OrderDocument } from "@/db/schema";

/**
 * useOrder
 * Fetches a user's order via GET /api/user/orders/[id].
 */
export function useOrder(orderId: string | null) {
  return useCartOrder<OrderDocument>(orderId, {
    endpoint: `/api/user/orders/${orderId}`,
    queryKeyPrefix: "order",
  });
}
