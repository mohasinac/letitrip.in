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
import { THEME_CONSTANTS, API_ENDPOINTS, ROUTES } from "@/constants";
import { useTranslations } from "next-intl";
import { useAuth, useApiQuery, useApiMutation, useMessage } from "@/hooks";
import { apiClient } from "@/lib/api-client";

const { themed, spacing, typography } = THEME_CONSTANTS;

interface PayoutsResponse {
  summary: PayoutSummary;
  payouts: PayoutRecord[];
}

export default function SellerPayoutsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showSuccess, showError } = useMessage();
  const t = useTranslations("sellerPayouts");
  const tLoading = useTranslations("loading");

  useEffect(() => {
    if (!authLoading && !user) router.replace(ROUTES.AUTH.LOGIN);
  }, [user, authLoading, router]);

  const { data, isLoading, refetch } = useApiQuery<PayoutsResponse>({
    queryKey: ["seller-payouts", user?.uid ?? ""],
    queryFn: () => apiClient.get<PayoutsResponse>(API_ENDPOINTS.SELLER.PAYOUTS),
    enabled: !!user,
    cacheTTL: 0,
  });

  const { mutate: requestPayout, isLoading: submitting } = useApiMutation<
    unknown,
    Record<string, unknown>
  >({
    mutationFn: (payload) =>
      apiClient.post(API_ENDPOINTS.SELLER.PAYOUTS, payload),
  });

  if (authLoading || !user) {
    return (
      <div
        className={`${themed.bgPrimary} min-h-screen flex items-center justify-center`}
      >
        <p className={themed.textSecondary}>{tLoading("default")}</p>
      </div>
    );
  }

  const summary = data?.summary;
  const payouts = data?.payouts ?? [];

  const handleRequestPayout = async (payload: Record<string, unknown>) => {
    const result = await requestPayout(payload);
    if (result) {
      showSuccess(t("statusPending"));
      refetch();
    } else {
      showError(t("noEarnings"));
    }
  };

  return (
    <div className={`${themed.bgPrimary} min-h-screen`}>
      <div className={`max-w-4xl mx-auto ${spacing.padding.lg}`}>
        <div className={`${spacing.stack} mb-8`}>
          <h1 className={`${typography.h2} ${themed.textPrimary}`}>
            {t("pageTitle")}
          </h1>
          <p className={themed.textSecondary}>{t("pageSubtitle")}</p>
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
