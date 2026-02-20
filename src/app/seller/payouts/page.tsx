/**
 * Seller Payouts Page
 *
 * Route: /seller/payouts
 * Displays earnings summary, payout request form, and payout history.
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  SellerPayoutStats,
  SellerPayoutRequestForm,
  SellerPayoutHistoryTable,
} from "@/components";
import type { PayoutSummary, PayoutRecord } from "@/components";
import { UI_LABELS, THEME_CONSTANTS, API_ENDPOINTS, ROUTES } from "@/constants";
import { useAuth, useApiQuery, useApiMutation, useMessage } from "@/hooks";

const { themed, spacing, typography } = THEME_CONSTANTS;

interface PayoutsResponse {
  data: {
    summary: PayoutSummary;
    payouts: PayoutRecord[];
  };
}

export default function SellerPayoutsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showSuccess, showError } = useMessage();

  useEffect(() => {
    if (!authLoading && !user) router.replace(ROUTES.AUTH.LOGIN);
  }, [user, authLoading, router]);

  const { data, isLoading, refetch } = useApiQuery<PayoutsResponse>({
    queryKey: ["seller-payouts", user?.uid ?? ""],
    queryFn: () => fetch(API_ENDPOINTS.SELLER.PAYOUTS).then((r) => r.json()),
    enabled: !!user,
    cacheTTL: 0,
  });

  const { mutate: requestPayout, isLoading: submitting } = useApiMutation<
    unknown,
    Record<string, unknown>
  >({
    mutationFn: (payload) =>
      fetch(API_ENDPOINTS.SELLER.PAYOUTS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then((r) => r.json()),
  });

  if (authLoading || !user) {
    return (
      <div
        className={`${themed.bgPrimary} min-h-screen flex items-center justify-center`}
      >
        <p className={themed.textSecondary}>{UI_LABELS.LOADING.DEFAULT}</p>
      </div>
    );
  }

  const summary = data?.data?.summary;
  const payouts = data?.data?.payouts ?? [];

  const handleRequestPayout = async (payload: Record<string, unknown>) => {
    const result = await requestPayout(payload);
    if (result) {
      showSuccess(UI_LABELS.SELLER_PAYOUTS.STATUS_PENDING);
      refetch();
    } else {
      showError(UI_LABELS.SELLER_PAYOUTS.NO_EARNINGS);
    }
  };

  return (
    <div className={`${themed.bgPrimary} min-h-screen`}>
      <div className={`max-w-4xl mx-auto ${spacing.padding.lg}`}>
        <div className={`${spacing.stack} mb-8`}>
          <h1 className={`${typography.h2} ${themed.textPrimary}`}>
            {UI_LABELS.SELLER_PAYOUTS.PAGE_TITLE}
          </h1>
          <p className={themed.textSecondary}>
            {UI_LABELS.SELLER_PAYOUTS.PAGE_SUBTITLE}
          </p>
        </div>

        <SellerPayoutStats summary={summary} isLoading={isLoading} />

        {!isLoading && summary && (
          <SellerPayoutRequestForm
            summary={summary}
            submitting={submitting}
            onSubmit={handleRequestPayout}
          />
        )}

        <SellerPayoutHistoryTable payouts={payouts} isLoading={isLoading} />
      </div>
    </div>
  );
}
