"use client";

import { useAuth } from "@/hooks";
import { useQuery, useMutation } from "@tanstack/react-query";
import { listSellerPayoutsAction, requestPayoutAction } from "@/actions";
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
    queryFn: async () => {
      const result = await listSellerPayoutsAction();
      const payouts = result.items as unknown as PayoutRecord[];
      const completed = payouts.filter((p) => p.status === "completed");
      const pending = payouts.filter((p) => p.status === "pending");
      const grossEarnings = payouts.reduce(
        (s, p) => s + (p.grossAmount ?? 0),
        0,
      );
      const totalPaidOut = completed.reduce((s, p) => s + (p.amount ?? 0), 0);
      const platformFee = payouts.reduce((s, p) => s + (p.platformFee ?? 0), 0);
      const pendingAmount = pending.reduce((s, p) => s + (p.amount ?? 0), 0);
      const summary: PayoutSummary = {
        availableEarnings: pendingAmount,
        grossEarnings,
        platformFee,
        platformFeeRate: 0.05,
        totalPaidOut,
        pendingAmount,
        hasPendingPayout: pending.length > 0,
        eligibleOrderCount: pending.length,
      };
      return { summary, payouts };
    },
    enabled: !!user,
    staleTime: 0,
  });

  const { mutate: requestPayout, isPending: submitting } = useMutation<
    unknown,
    Error,
    Record<string, unknown>
  >({
    mutationFn: (payload) =>
      requestPayoutAction(payload as Parameters<typeof requestPayoutAction>[0]),
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
