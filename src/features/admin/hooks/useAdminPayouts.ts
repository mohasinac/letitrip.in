"use client";

import { useApiQuery, useApiMutation } from "@/hooks";
import { adminService } from "@/services";
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
  const queryFnParam = sieveParams ? `?${sieveParams}` : "";

  const query = useApiQuery<PayoutsResponse>({
    queryKey: ["admin", "payouts", sieveParams],
    queryFn: () => adminService.listPayouts(queryFnParam),
  });

  const updateMutation = useApiMutation<unknown, { id: string; data: unknown }>(
    {
      mutationFn: ({ id, data: update }) =>
        adminService.updatePayout(id, update),
    },
  );

  return { ...query, updateMutation };
}
