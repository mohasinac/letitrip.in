"use client";

import { useAuth } from "@/contexts/SessionContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/appkit/http";
import { API_ENDPOINTS } from "@/constants";
import { requestPayoutAction } from "@/actions";
import type { PayoutSummary } from "../components/SellerPayoutStats";
import type { PayoutRecord } from "../components/SellerPayoutHistoryTable";

export interface SellerPayoutsResponse {
  summary: PayoutSummary;
  payouts: PayoutRecord[];
}

/**
 * useSellerPayouts
 * Fetches seller payouts via GET /api/seller/payouts.
 */
export function useSellerPayouts() {
  const { user, loading } = useAuth();

  const { data, isLoading, error, refetch } = useQuery<SellerPayoutsResponse>({
    queryKey: ["seller-payouts", user?.uid ?? ""],
    queryFn: () =>
      apiClient.get<SellerPayoutsResponse>(API_ENDPOINTS.SELLER.PAYOUTS),
    enabled: !!user,
    staleTime: 0,
  });

  const { mutateAsync: requestPayout, isPending: submitting } = useMutation<
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

