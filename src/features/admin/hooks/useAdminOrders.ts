"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { adminService } from "@/services";
import { adminUpdateOrderAction } from "@/actions";
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
  const query = useQuery<{
    orders: OrderDocument[];
    meta: OrderListMeta;
  }>({
    queryKey: ["admin", "orders", sieveParams],
    queryFn: () => adminService.listOrders(sieveParams),
  });

  const updateMutation = useMutation<
    OrderDocument,
    Error,
    { id: string; data: unknown }
  >({
    mutationFn: ({ id, data }) =>
      adminUpdateOrderAction(
        id,
        data as Parameters<typeof adminUpdateOrderAction>[1],
      ),
  });

  return { ...query, updateMutation };
}
