"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { adminService } from "@/services";
import { adminUpdatePayoutAction } from "@/actions";
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

  const query = useQuery<PayoutsResponse>({
    queryKey: ["admin", "payouts", sieveParams],
    queryFn: () => adminService.listPayouts(queryFnParam),
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
