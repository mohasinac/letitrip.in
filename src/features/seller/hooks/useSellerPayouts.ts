"use client";

import { useAuth } from "@/hooks";
import { useQuery, useMutation } from "@tanstack/react-query";
import { sellerService } from "@/services";
import type { PayoutSummary } from "../components/SellerPayoutStats";
import type { PayoutRecord } from "../components/SellerPayoutHistoryTable";

export interface SellerPayoutsResponse {
  summary: PayoutSummary;
  payouts: PayoutRecord[];
}

/**
 * useSellerPayouts
 * Wraps `sellerService.listPayouts()` (query) and `sellerService.requestPayout()` (mutation)
 * for the seller payouts page.
 */
export function useSellerPayouts() {
  const { user, loading } = useAuth();

  const { data, isLoading, error, refetch } = useQuery<SellerPayoutsResponse>({
    queryKey: ["seller-payouts", user?.uid ?? ""],
    queryFn: () => sellerService.listPayouts(),
    enabled: !!user,
    staleTime: 0,
  });

  const { mutate: requestPayout, isPending: submitting } = useMutation<
    unknown,
    Error,
    Record<string, unknown>
  >({
    mutationFn: (payload) => sellerService.requestPayout(payload),
  });

  return {
    summary: data?.summary,
    payouts: data?.payouts ?? [],
    isLoading: loading || isLoading,
    error,
    refetch,
    requestPayout,
    submitting,
  };
}
