"use client";

import { useMutation } from "@tanstack/react-query";
import { adminUpdatePayoutAction } from "@/actions";
import { createAdminListQuery } from "./createAdminListQuery";
import type { AdminListMeta } from "./createAdminListQuery";
import type { PayoutDocument } from "@/db/schema";

export function useAdminPayouts(sieveParams: string) {
  const query = createAdminListQuery<{
    payouts: PayoutDocument[];
    meta: AdminListMeta;
  }>({
    queryKey: ["admin", "payouts"],
    sieveParams,
    endpoint: "/api/admin/payouts",
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

