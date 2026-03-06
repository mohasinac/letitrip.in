/**
 * Seller Payouts Page
 *
 * Route: /seller/payouts
 * Displays earnings summary, payout request form, and payout history.
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { Heading, Text } from "@/components";
import {
  SellerPayoutStats,
  SellerPayoutRequestForm,
  SellerPayoutHistoryTable,
} from "@/features/seller";
import type { PayoutSummary, PayoutRecord } from "@/features/seller";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { useTranslations } from "next-intl";
import { useAuth, useApiQuery, useApiMutation, useMessage } from "@/hooks";
import { sellerService } from "@/services";

const { themed, spacing, typography, flex } = THEME_CONSTANTS;

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
    queryFn: () => sellerService.listPayouts(),
    enabled: !!user,
    cacheTTL: 0,
  });

  const { mutate: requestPayout, isLoading: submitting } = useApiMutation<
    unknown,
    Record<string, unknown>
  >({
    mutationFn: (payload) => sellerService.requestPayout(payload),
  });

  if (authLoading || !user) {
    return (
      <div className={`${themed.bgPrimary} min-h-screen ${flex.center}`}>
        <Text variant="secondary">{tLoading("default")}</Text>
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
          <Heading level={1} className={typography.h2}>
            {t("pageTitle")}
          </Heading>
          <Text variant="secondary">{t("pageSubtitle")}</Text>
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
