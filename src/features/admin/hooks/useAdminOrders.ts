"use client";

import { useApiQuery, useApiMutation } from "@/hooks";
import { adminService } from "@/services";
import type { OrderDocument } from "@/db/schema";

interface OrderListMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * useAdminOrders
 * Fetches orders for the admin orders list using a Sieve query string.
 * Exposes the order list, pagination meta, loading/error state, refetch,
 * and an updateOrder mutation.
 *
 * @param sieveParams - Full Sieve query string (filters + sorts + page + pageSize)
 */
export function useAdminOrders(sieveParams: string) {
  const query = useApiQuery<{
    orders: OrderDocument[];
    meta: OrderListMeta;
  }>({
    queryKey: ["admin", "orders", sieveParams],
    queryFn: () => adminService.listOrders(sieveParams),
  });

  const updateMutation = useApiMutation<
    OrderDocument,
    { id: string; data: unknown }
  >({
    mutationFn: ({ id, data }) => adminService.updateOrder(id, data),
  });

  return { ...query, updateMutation };
}
