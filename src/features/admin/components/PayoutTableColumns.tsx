/**
 * PayoutTableColumns
 * Path: src/components/admin/payouts/PayoutTableColumns.tsx
 *
 * Column definitions for the admin Payouts DataTable.
 */

import { UI_LABELS } from "@/constants";
import { formatCurrency, formatDate } from "@/utils";
import { Text, Caption, Button, Badge } from "@mohasinac/appkit/ui";

import type { PayoutDocument } from "@/db/schema";

const LABELS = UI_LABELS.ADMIN.PAYOUTS;

const PAYOUT_STATUS_VARIANTS: Record<
  string,
  "pending" | "info" | "success" | "danger"
> = {
  pending: "pending",
  processing: "info",
  completed: "success",
  failed: "danger",
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
            <Text weight="medium" size="sm" className="truncate max-w-[150px]">
              {payout.sellerName}
            </Text>
            <Caption className="truncate max-w-[150px]">
              {payout.sellerEmail}
            </Caption>
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
            <Text weight="semibold" size="sm" className="tabular-nums">
              {formatCurrency(payout.amount)}
            </Text>
            <Caption>
              {LABELS.ORDERS_COUNT}: {payout.orderIds?.length ?? 0}
            </Caption>
          </div>
        ),
      },
      {
        key: "paymentMethod",
        header: LABELS.METHOD,
        width: "15%",
        render: (payout: PayoutDocument) => (
          <div>
            <Text size="sm">
              {PAYMENT_METHOD_LABELS[payout.paymentMethod] ??
                payout.paymentMethod}
            </Text>
            {payout.paymentMethod === "bank_transfer" && payout.bankAccount ? (
              <Caption>
                {payout.bankAccount.bankName} ·{" "}
                {payout.bankAccount.accountNumberMasked}
              </Caption>
            ) : payout.paymentMethod === "upi" && payout.upiId ? (
              <Caption>{payout.upiId}</Caption>
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
          <Badge variant={PAYOUT_STATUS_VARIANTS[payout.status] ?? "default"}>
            {PAYOUT_STATUS_LABELS[payout.status] ?? payout.status}
          </Badge>
        ),
      },
      {
        key: "requestedAt",
        header: LABELS.REQUESTED,
        sortable: true,
        width: "15%",
        render: (payout: PayoutDocument) => (
          <Text size="sm" variant="secondary">
            {payout.requestedAt ? formatDate(payout.requestedAt) : "—"}
          </Text>
        ),
      },
      {
        key: "actions",
        header: UI_LABELS.TABLE.ACTIONS,
        width: "10%",
        render: (payout: PayoutDocument) => (
          <Button variant="ghost" size="sm" onClick={() => onView(payout)}>
            {UI_LABELS.ACTIONS.VIEW}
          </Button>
        ),
      },
    ],
  };
}
