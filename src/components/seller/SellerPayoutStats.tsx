"use client";

import { Card } from "@/components/ui";
import { UI_LABELS, THEME_CONSTANTS } from "@/constants";
import { formatCurrency } from "@/utils";

const { themed, spacing, typography } = THEME_CONSTANTS;
const LABELS = UI_LABELS.SELLER_PAYOUTS;

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
  if (isLoading) {
    return <p className={`${themed.textSecondary} mb-6`}>{LABELS.LOADING}</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      <Card className={spacing.padding.md}>
        <p className={`text-sm ${themed.textSecondary}`}>
          {LABELS.AVAILABLE_EARNINGS}
        </p>
        <p className={`${typography.h3} text-emerald-600 mt-1`}>
          {formatCurrency(summary?.availableEarnings ?? 0)}
        </p>
      </Card>
      <Card className={spacing.padding.md}>
        <p className={`text-sm ${themed.textSecondary}`}>{LABELS.TOTAL_PAID}</p>
        <p className={`${typography.h3} ${themed.textPrimary} mt-1`}>
          {formatCurrency(summary?.totalPaidOut ?? 0)}
        </p>
      </Card>
      <Card className={spacing.padding.md}>
        <p className={`text-sm ${themed.textSecondary}`}>
          {LABELS.PENDING_PAYOUT}
        </p>
        <p className={`${typography.h3} text-amber-600 mt-1`}>
          {formatCurrency(summary?.pendingAmount ?? 0)}
        </p>
      </Card>
    </div>
  );
}
