"use client";

import { Card, Badge } from "@/components/ui";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import { formatCurrency, formatDate } from "@/utils";

const { themed, spacing, typography } = THEME_CONSTANTS;

export interface PayoutRecord {
  id: string;
  amount: number;
  grossAmount: number;
  platformFee: number;
  status: "pending" | "processing" | "completed" | "failed";
  paymentMethod: "bank_transfer" | "upi";
  requestedAt: string;
  processedAt?: string;
  adminNote?: string;
  orderIds: string[];
}

const STATUS_VARIANT: Record<
  PayoutRecord["status"],
  "pending" | "info" | "success" | "danger"
> = {
  pending: "pending",
  processing: "info",
  completed: "success",
  failed: "danger",
};

interface SellerPayoutHistoryTableProps {
  payouts: PayoutRecord[];
  isLoading: boolean;
}

export function SellerPayoutHistoryTable({
  payouts,
  isLoading,
}: SellerPayoutHistoryTableProps) {
  const t = useTranslations("sellerPayouts");
  const STATUS_LABEL: Record<PayoutRecord["status"], string> = {
    pending: t("statusPending"),
    processing: t("statusProcessing"),
    completed: t("statusCompleted"),
    failed: t("statusFailed"),
  };
  const TABLE_HEADERS = [
    t("grossAmount"),
    t("platformFeeLabel"),
    t("netAmount"),
    t("paymentMethodLabel"),
    t("status"),
    t("requested"),
  ];
  return (
    <div>
      <h2 className={`${typography.h3} ${themed.textPrimary} mb-4`}>
        {t("historyTitle")}
      </h2>

      {isLoading ? (
        <p className={themed.textSecondary}>{t("loading")}</p>
      ) : payouts.length === 0 ? (
        <Card className={`${spacing.padding.lg} text-center`}>
          <p className={`${themed.textSecondary} font-medium`}>
            {t("noPayouts")}
          </p>
          <p className={`text-sm ${themed.textSecondary} mt-1`}>
            {t("noPayoutsDesc")}
          </p>
        </Card>
      ) : (
        <div className={`overflow-x-auto rounded-xl border ${themed.border}`}>
          <table className="w-full text-sm">
            <thead className={themed.bgSecondary}>
              <tr>
                {TABLE_HEADERS.map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-left font-medium ${themed.textSecondary}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {payouts.map((p) => (
                <tr
                  key={p.id}
                  className={`${themed.bgPrimary} hover:${themed.bgSecondary}`}
                >
                  <td className={`px-4 py-3 ${themed.textPrimary}`}>
                    {formatCurrency(p.grossAmount)}
                  </td>
                  <td className={`px-4 py-3 ${themed.textSecondary}`}>
                    {formatCurrency(p.platformFee)}
                  </td>
                  <td
                    className={`px-4 py-3 font-semibold ${themed.textPrimary}`}
                  >
                    {formatCurrency(p.amount)}
                  </td>
                  <td className={`px-4 py-3 ${themed.textSecondary}`}>
                    {p.paymentMethod === "bank_transfer"
                      ? t("paymentMethodBank")
                      : t("paymentMethodUpi")}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[p.status]}>
                      {STATUS_LABEL[p.status]}
                    </Badge>
                  </td>
                  <td className={`px-4 py-3 ${themed.textSecondary}`}>
                    {formatDate(new Date(p.requestedAt))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
