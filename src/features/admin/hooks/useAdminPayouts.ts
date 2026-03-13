"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { listAdminPayoutsAction, adminUpdatePayoutAction } from "@/actions";
import type { PayoutDocument } from "@/db/schema";

interface PayoutsResponse {
  payouts: PayoutDocument[];
  meta?: {
    total: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
  };
}

/**
 * useAdminPayouts
 * Fetches payouts using a full Sieve query string and exposes an update mutation.
 */
export function useAdminPayouts(sieveParams: string) {
  const query = useQuery<PayoutsResponse>({
    queryKey: ["admin", "payouts", sieveParams],
    queryFn: async () => {
      const sp = new URLSearchParams(sieveParams);
      const result = await listAdminPayoutsAction({
        filters: sp.get("filters") ?? undefined,
        sorts: sp.get("sorts") ?? undefined,
        page: sp.has("page") ? Number(sp.get("page")) : undefined,
        pageSize: sp.has("pageSize") ? Number(sp.get("pageSize")) : undefined,
      });
      return {
        payouts: result.items,
        meta: {
          total: result.total,
          page: result.page,
          pageSize: result.pageSize,
          totalPages: result.totalPages,
        },
      };
    },
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
