"use client";

import { SellerPayoutStats as AppkitSellerPayoutStats } from "@mohasinac/appkit/features/seller";
import { Grid, Text } from "@mohasinac/appkit/ui";
import { Card } from "@/components";
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
  return (
    <AppkitSellerPayoutStats
      isLoading={isLoading}
      className="mb-8"
      renderLoading={() => <Text variant="secondary">{t("loading")}</Text>}
      renderStats={() => (
        <Grid cols="statTiles">
          <Card className="p-4">
            <Text size="sm" variant="secondary">
              {t("availableEarnings")}
            </Text>
            <Text className={`${typography.h3} text-emerald-600 mt-1`}>
              {formatCurrency(summary?.availableEarnings ?? 0)}
            </Text>
          </Card>
          <Card className="p-4">
            <Text size="sm" variant="secondary">
              {t("totalPaid")}
            </Text>
            <Text className={`${typography.h3} ${themed.textPrimary} mt-1`}>
              {formatCurrency(summary?.totalPaidOut ?? 0)}
            </Text>
          </Card>
          <Card className="p-4">
            <Text size="sm" variant="secondary">
              {t("pendingPayout")}
            </Text>
            <Text className={`${typography.h3} text-amber-600 mt-1`}>
              {formatCurrency(summary?.pendingAmount ?? 0)}
            </Text>
          </Card>
        </Grid>
      )}
    />
  );
}
