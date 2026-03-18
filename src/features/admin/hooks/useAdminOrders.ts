"use client";

import { useMutation } from "@tanstack/react-query";
import { adminUpdateOrderAction } from "@/actions";
import { createAdminListQuery } from "./createAdminListQuery";
import type { AdminListMeta } from "./createAdminListQuery";
import type { OrderDocument } from "@/db/schema";

export function useAdminOrders(sieveParams: string) {
  const query = createAdminListQuery<{
    orders: OrderDocument[];
    meta: AdminListMeta;
  }>({
    queryKey: ["admin", "orders"],
    sieveParams,
    endpoint: "/api/admin/orders",
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
