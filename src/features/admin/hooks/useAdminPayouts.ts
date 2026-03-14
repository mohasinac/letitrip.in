"use client";

import { useMutation } from "@tanstack/react-query";
import { listAdminPayoutsAction, adminUpdatePayoutAction } from "@/actions";
import { createAdminListQuery, extractBasicMeta } from "./createAdminListQuery";
import type { AdminListMeta } from "./createAdminListQuery";
import type { PayoutDocument } from "@/db/schema";

export function useAdminPayouts(sieveParams: string) {
  const query = createAdminListQuery<
    PayoutDocument,
    { payouts: PayoutDocument[]; meta: AdminListMeta }
  >({
    queryKey: ["admin", "payouts"],
    sieveParams,
    action: listAdminPayoutsAction,
    transform: (result) => ({
      payouts: result.items,
      meta: extractBasicMeta(result),
    }),
  });

  const updateMutation = useMutation<
    unknown,
    Error,
    { id: string; data: unknown }
  >({
    mutationFn: ({ id, data: update }) =>
      adminUpdatePayoutAction(
        id,
        update as Parameters<typeof adminUpdatePayoutAction>[1],
      ),
  });

  return { ...query, updateMutation };
}
