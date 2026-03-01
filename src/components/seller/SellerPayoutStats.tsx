"use client";

import { Card } from "@/components/ui";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import { formatCurrency } from "@/utils";

const { themed, spacing, typography } = THEME_CONSTANTS;

export interface PayoutSummary {
  availableEarnings: number;
  grossEarnings: number;
  platformFee: number;
  platformFeeRate: number;
  totalPaidOut: number;
  pendingAmount: number;
  hasPendingPayout: boolean;
  eligibleOrderCount: number;
}

interface SellerPayoutStatsProps {
  summary: PayoutSummary | undefined;
  isLoading: boolean;
}

export function SellerPayoutStats({
  summary,
  isLoading,
}: SellerPayoutStatsProps) {
  const t = useTranslations("sellerPayouts");
  if (isLoading) {
    return <p className={`${themed.textSecondary} mb-6`}>{t("loading")}</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4 mb-8">
      <Card className={spacing.padding.md}>
        <p className={`text-sm ${themed.textSecondary}`}>
          {t("availableEarnings")}
        </p>
        <p className={`${typography.h3} text-emerald-600 mt-1`}>
          {formatCurrency(summary?.availableEarnings ?? 0)}
        </p>
      </Card>
      <Card className={spacing.padding.md}>
        <p className={`text-sm ${themed.textSecondary}`}>{t("totalPaid")}</p>
        <p className={`${typography.h3} ${themed.textPrimary} mt-1`}>
          {formatCurrency(summary?.totalPaidOut ?? 0)}
        </p>
      </Card>
      <Card className={spacing.padding.md}>
        <p className={`text-sm ${themed.textSecondary}`}>
          {t("pendingPayout")}
        </p>
        <p className={`${typography.h3} text-amber-600 mt-1`}>
          {formatCurrency(summary?.pendingAmount ?? 0)}
        </p>
      </Card>
    </div>
  );
}
