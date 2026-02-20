"use client";

import { Card, Badge } from "@/components/ui";
import { UI_LABELS, THEME_CONSTANTS } from "@/constants";
import { formatCurrency, formatDate } from "@/utils";

const { themed, spacing, typography } = THEME_CONSTANTS;
const LABELS = UI_LABELS.SELLER_PAYOUTS;

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

const STATUS_LABEL: Record<PayoutRecord["status"], string> = {
  pending: LABELS.STATUS_PENDING,
  processing: LABELS.STATUS_PROCESSING,
  completed: LABELS.STATUS_COMPLETED,
  failed: LABELS.STATUS_FAILED,
};

const TABLE_HEADERS = [
  LABELS.GROSS_AMOUNT,
  LABELS.PLATFORM_FEE_LABEL,
  LABELS.NET_AMOUNT,
  LABELS.PAYMENT_METHOD_LABEL,
  "Status",
  "Requested",
];

interface SellerPayoutHistoryTableProps {
  payouts: PayoutRecord[];
  isLoading: boolean;
}

export function SellerPayoutHistoryTable({
  payouts,
  isLoading,
}: SellerPayoutHistoryTableProps) {
  return (
    <div>
      <h2 className={`${typography.h3} ${themed.textPrimary} mb-4`}>
        {LABELS.HISTORY_TITLE}
      </h2>

      {isLoading ? (
        <p className={themed.textSecondary}>{LABELS.LOADING}</p>
      ) : payouts.length === 0 ? (
        <Card className={`${spacing.padding.lg} text-center`}>
          <p className={`${themed.textSecondary} font-medium`}>
            {LABELS.NO_PAYOUTS}
          </p>
          <p className={`text-sm ${themed.textSecondary} mt-1`}>
            {LABELS.NO_PAYOUTS_DESC}
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
                      ? LABELS.PAYMENT_METHOD_BANK
                      : LABELS.PAYMENT_METHOD_UPI}
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
