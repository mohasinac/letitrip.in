"use client";

/**
 * PAYOUT_TABLE_COLUMNS
 * Path: src/components/seller/PayoutTableColumns.tsx
 *
 * Static column definitions for the Seller Payout History DataTable.
 * Consumed by SellerPayoutHistoryTable.tsx.
 */

import React from "react";
import { Text, Caption, Badge } from "@/components";
import { formatCurrency, formatDate, formatDateTime } from "@/utils";

export type PayoutStatus = "pending" | "processing" | "completed" | "failed";
export type PayoutMethod = "bank_transfer" | "upi";

export interface PayoutRecord {
  id: string;
  amount: number;
  grossAmount: number;
  platformFee: number;
  status: PayoutStatus;
  paymentMethod: PayoutMethod;
  requestedAt: string;
  processedAt?: string;
  adminNote?: string;
  orderIds: string[];
}

const STATUS_VARIANT: Record<
  PayoutStatus,
  "pending" | "info" | "success" | "danger"
> = {
  pending: "pending",
  processing: "info",
  completed: "success",
  failed: "danger",
};

const STATUS_LABEL: Record<PayoutStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  failed: "Failed",
};

const PAYMENT_METHOD_LABEL: Record<PayoutMethod, string> = {
  bank_transfer: "Bank Transfer",
  upi: "UPI",
};

type Column = {
  key: string;
  header: string;
  render?: (item: PayoutRecord) => React.ReactNode;
  width?: string;
};

export const PAYOUT_TABLE_COLUMNS: Column[] = [
  {
    key: "grossAmount",
    header: "Gross Amount",
    width: "14%",
    render: (p) => <Text size="sm">{formatCurrency(p.grossAmount)}</Text>,
  },
  {
    key: "platformFee",
    header: "Platform Fee",
    width: "14%",
    render: (p) => <Caption>{formatCurrency(p.platformFee)}</Caption>,
  },
  {
    key: "amount",
    header: "Net Amount",
    width: "14%",
    render: (p) => (
      <Text weight="semibold">{formatCurrency(p.amount, "INR", "en-IN")}</Text>
    ),
  },
  {
    key: "paymentMethod",
    header: "Method",
    width: "14%",
    render: (p) => <Caption>{PAYMENT_METHOD_LABEL[p.paymentMethod]}</Caption>,
  },
  {
    key: "status",
    header: "Status",
    width: "14%",
    render: (p) => (
      <Badge variant={STATUS_VARIANT[p.status]}>{STATUS_LABEL[p.status]}</Badge>
    ),
  },
  {
    key: "requestedAt",
    header: "Requested",
    width: "15%",
    render: (p) => <Caption>{formatDate(new Date(p.requestedAt))}</Caption>,
  },
  {
    key: "processedAt",
    header: "Processed",
    width: "15%",
    render: (p) => (
      <Caption>
        {p.processedAt ? formatDateTime(new Date(p.processedAt)) : "—"}
      </Caption>
    ),
  },
];
