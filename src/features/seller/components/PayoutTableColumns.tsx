"use client";
import { Caption, Text, Badge } from "@mohasinac/appkit/ui";

import { formatCurrency, formatDate, formatDateTime } from "@mohasinac/appkit/utils";


/**
 * PAYOUT_TABLE_COLUMNS
 * Path: src/components/seller/PayoutTableColumns.tsx
 *
 * Static column definitions for the Seller Payout History DataTable.
 * Consumed by SellerPayoutHistoryTable.tsx.
 */

import React from "react";
import { UI_LABELS } from "@/constants";

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

const LABELS = UI_LABELS.ADMIN.PAYOUTS;

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
  pending: LABELS.STATUS_PENDING,
  processing: LABELS.STATUS_PROCESSING,
  completed: LABELS.STATUS_COMPLETED,
  failed: LABELS.STATUS_FAILED,
};

const PAYMENT_METHOD_LABEL: Record<PayoutMethod, string> = {
  bank_transfer: LABELS.PAYMENT_METHOD_BANK,
  upi: LABELS.PAYMENT_METHOD_UPI,
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
    header: LABELS.GROSS_AMOUNT,
    width: "14%",
    render: (p) => <Text size="sm">{formatCurrency(p.grossAmount)}</Text>,
  },
  {
    key: "platformFee",
    header: LABELS.PLATFORM_FEE,
    width: "14%",
    render: (p) => <Caption>{formatCurrency(p.platformFee)}</Caption>,
  },
  {
    key: "amount",
    header: LABELS.AMOUNT,
    width: "14%",
    render: (p) => (
      <Text weight="semibold">{formatCurrency(p.amount, "INR", "en-IN")}</Text>
    ),
  },
  {
    key: "paymentMethod",
    header: LABELS.METHOD,
    width: "14%",
    render: (p) => <Caption>{PAYMENT_METHOD_LABEL[p.paymentMethod]}</Caption>,
  },
  {
    key: "status",
    header: LABELS.STATUS,
    width: "14%",
    render: (p) => (
      <Badge variant={STATUS_VARIANT[p.status]}>{STATUS_LABEL[p.status]}</Badge>
    ),
  },
  {
    key: "requestedAt",
    header: LABELS.REQUESTED,
    width: "15%",
    render: (p) => <Caption>{formatDate(new Date(p.requestedAt))}</Caption>,
  },
  {
    key: "processedAt",
    header: LABELS.PROCESSED,
    width: "15%",
    render: (p) => (
      <Caption>
        {p.processedAt ? formatDateTime(new Date(p.processedAt)) : "—"}
      </Caption>
    ),
  },
];

