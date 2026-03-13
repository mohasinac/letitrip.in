"use client";

import { useTranslations } from "next-intl";
import { Card, Caption, Divider, Heading, Text } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { formatCurrency } from "@/utils";

const { flex, position } = THEME_CONSTANTS;

export interface PayoutBreakdown {
  grossAmount: number;
  platformFee: number;
  platformFeeRate: number;
  gatewayFee?: number;
  gatewayFeeRate?: number;
  gstAmount?: number;
  gstRate?: number;
  netAmount: number;
  currency?: string;
  orderIds?: string[];
  isAutomatic?: boolean;
}

interface PayoutBreakdownModalProps {
  open: boolean;
  onClose: () => void;
  breakdown: PayoutBreakdown | null;
}

export function PayoutBreakdownModal({
  open,
  onClose,
  breakdown,
}: PayoutBreakdownModalProps) {
  const t = useTranslations("sellerPayouts");

  if (!open || !breakdown) return null;

  const currency = breakdown.currency ?? "INR";

  const rows: { label: string; value: string; highlight?: boolean }[] = [
    {
      label: t("grossAmount"),
      value: formatCurrency(breakdown.grossAmount, currency),
    },
    {
      label: `${t("platformFeeLabel")} (${(breakdown.platformFeeRate * 100).toFixed(0)}%)`,
      value: `− ${formatCurrency(breakdown.platformFee, currency)}`,
    },
  ];

  if (breakdown.gatewayFee !== undefined) {
    rows.push({
      label: `${t("gatewayFeeLabel")} (${((breakdown.gatewayFeeRate ?? 0) * 100).toFixed(2)}%)`,
      value: `− ${formatCurrency(breakdown.gatewayFee, currency)}`,
    });
  }

  if (breakdown.gstAmount !== undefined) {
    rows.push({
      label: `${t("gstLabel")} (${((breakdown.gstRate ?? 0) * 100).toFixed(0)}%)`,
      value: `− ${formatCurrency(breakdown.gstAmount, currency)}`,
    });
  }

  rows.push({
    label: t("netPayout"),
    value: formatCurrency(breakdown.netAmount, currency),
    highlight: true,
  });

  return (
    <div
      className={`${position.fixedFill} z-50 ${flex.center} p-4 bg-black/50 backdrop-blur-sm`}
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
        <Card className="p-6 space-y-3">
          <Heading level={3}>{t("breakdownTitle")}</Heading>

          {breakdown.isAutomatic && (
            <Caption className="text-blue-600">{t("autoPayoutBadge")}</Caption>
          )}

          {rows.map((row, i) => (
            <div key={i}>
              {row.highlight && <Divider className="my-2" />}
              <div className={`${flex.rowCenter} justify-between`}>
                <Text
                  className={
                    row.highlight ? "font-semibold" : "text-sm text-neutral-600"
                  }
                >
                  {row.label}
                </Text>
                <Text
                  className={
                    row.highlight ? "font-bold text-green-700" : "text-sm"
                  }
                >
                  {row.value}
                </Text>
              </div>
            </div>
          ))}

          {breakdown.orderIds && breakdown.orderIds.length > 0 && (
            <div className="mt-3">
              <Caption>
                {t("includesOrders", { count: breakdown.orderIds.length })}
              </Caption>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
