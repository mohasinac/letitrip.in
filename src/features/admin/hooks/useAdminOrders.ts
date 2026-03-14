"use client";

import { useMutation } from "@tanstack/react-query";
import { listAdminOrdersAction, adminUpdateOrderAction } from "@/actions";
import { createAdminListQuery, extractBasicMeta } from "./createAdminListQuery";
import type { AdminListMeta } from "./createAdminListQuery";
import type { OrderDocument } from "@/db/schema";

export function useAdminOrders(sieveParams: string) {
  const query = createAdminListQuery<
    OrderDocument,
    { orders: OrderDocument[]; meta: AdminListMeta }
  >({
    queryKey: ["admin", "orders"],
    sieveParams,
    action: listAdminOrdersAction,
    transform: (result) => ({
      orders: result.items,
      meta: extractBasicMeta(result),
    }),
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
