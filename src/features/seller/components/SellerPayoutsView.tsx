"use client";

import { Heading, Text } from "@/components";
import { SellerPayoutStats } from "./SellerPayoutStats";
import { SellerPayoutRequestForm } from "./SellerPayoutRequestForm";
import { SellerPayoutHistoryTable } from "./SellerPayoutHistoryTable";
import { useSellerPayouts } from "../hooks/useSellerPayouts";
import { THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import { useMessage } from "@/hooks";

const { themed, spacing, typography } = THEME_CONSTANTS;

export function SellerPayoutsView() {
  const { showSuccess, showError } = useMessage();
  const t = useTranslations("sellerPayouts");
  const { summary, payouts, isLoading, refetch, requestPayout, submitting } =
    useSellerPayouts();

  const handleRequestPayout = async (payload: Record<string, unknown>) => {
    try {
      await requestPayout(payload);
      showSuccess(t("statusPending"));
      refetch();
    } catch {
      showError(t("noEarnings"));
    }
  };

  return (
    <div className={`${themed.bgPrimary} min-h-screen`}>
      <div className="max-w-4xl mx-auto p-6">
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
