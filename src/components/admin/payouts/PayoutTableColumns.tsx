/**
 * PayoutTableColumns
 * Path: src/components/admin/payouts/PayoutTableColumns.tsx
 *
 * Column definitions for the admin Payouts DataTable.
 */

import { THEME_CONSTANTS, UI_LABELS } from "@/constants";
import { formatCurrency, formatDate } from "@/utils";
import type { PayoutDocument } from "@/db/schema";

const LABELS = UI_LABELS.ADMIN.PAYOUTS;
const { themed } = THEME_CONSTANTS;

const PAYOUT_STATUS_STYLES: Record<string, string> = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  processing:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  completed:
    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

const PAYOUT_STATUS_LABELS: Record<string, string> = {
  pending: LABELS.STATUS_PENDING,
  processing: LABELS.STATUS_PROCESSING,
  completed: LABELS.STATUS_COMPLETED,
  failed: LABELS.STATUS_FAILED,
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bank_transfer: LABELS.PAYMENT_METHOD_BANK,
  upi: LABELS.PAYMENT_METHOD_UPI,
};

export function getPayoutTableColumns(
  onView: (payout: PayoutDocument) => void,
) {
  return {
    columns: [
      {
        key: "sellerName",
        header: LABELS.SELLER,
        sortable: true,
        width: "20%",
        render: (payout: PayoutDocument) => (
          <div>
            <p className="font-medium text-sm truncate max-w-[150px]">
              {payout.sellerName}
            </p>
            <p
              className={`text-xs ${themed.textSecondary} truncate max-w-[150px]`}
            >
              {payout.sellerEmail}
            </p>
          </div>
        ),
      },
      {
        key: "amount",
        header: LABELS.AMOUNT,
        sortable: true,
        width: "12%",
        render: (payout: PayoutDocument) => (
          <div>
            <p className="font-semibold text-sm tabular-nums">
              {formatCurrency(payout.amount)}
            </p>
            <p className={`text-xs ${themed.textSecondary}`}>
              {LABELS.ORDERS_COUNT}: {payout.orderIds?.length ?? 0}
            </p>
          </div>
        ),
      },
      {
        key: "paymentMethod",
        header: LABELS.METHOD,
        width: "15%",
        render: (payout: PayoutDocument) => (
          <div>
            <p className="text-sm">
              {PAYMENT_METHOD_LABELS[payout.paymentMethod] ??
                payout.paymentMethod}
            </p>
            {payout.paymentMethod === "bank_transfer" && payout.bankAccount ? (
              <p className={`text-xs ${themed.textSecondary}`}>
                {payout.bankAccount.bankName} ·{" "}
                {payout.bankAccount.accountNumberMasked}
              </p>
            ) : payout.paymentMethod === "upi" && payout.upiId ? (
              <p className={`text-xs ${themed.textSecondary}`}>
                {payout.upiId}
              </p>
            ) : null}
          </div>
        ),
      },
      {
        key: "status",
        header: LABELS.STATUS,
        sortable: true,
        width: "12%",
        render: (payout: PayoutDocument) => (
          <span
            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
              PAYOUT_STATUS_STYLES[payout.status] ?? ""
            }`}
          >
            {PAYOUT_STATUS_LABELS[payout.status] ?? payout.status}
          </span>
        ),
      },
      {
        key: "requestedAt",
        header: LABELS.REQUESTED,
        sortable: true,
        width: "15%",
        render: (payout: PayoutDocument) => (
          <span className={`text-sm ${themed.textSecondary}`}>
            {payout.requestedAt ? formatDate(payout.requestedAt) : "—"}
          </span>
        ),
      },
      {
        key: "actions",
        header: UI_LABELS.TABLE.ACTIONS,
        width: "10%",
        render: (payout: PayoutDocument) => (
          <button
            onClick={() => onView(payout)}
            className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium"
          >
            {UI_LABELS.ACTIONS.VIEW}
          </button>
        ),
      },
    ],
  };
}
