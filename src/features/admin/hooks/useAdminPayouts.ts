"use client";

import { useApiQuery, useApiMutation } from "@/hooks";
import { adminService } from "@/services";
import type { PayoutDocument } from "@/db/schema";

interface PayoutsResponse {
  payouts: PayoutDocument[];
  meta?: { total: number };
}

/**
 * useAdminPayouts
 * Fetches payouts filtered by `statusFilter` and exposes an update mutation.
 */
export function useAdminPayouts(statusFilter: string) {
  const queryFnParam = statusFilter
    ? `?filters=${encodeURIComponent(`status==${statusFilter}`)}`
    : "";

  const query = useApiQuery<PayoutsResponse>({
    queryKey: ["admin", "payouts", statusFilter],
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
