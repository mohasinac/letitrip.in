"use client";

/**
 * useOrderTableColumns
 * Path: src/components/admin/orders/OrderTableColumns.tsx
 *
 * Column definitions hook for the admin Orders DataTable.
 */

import { THEME_CONSTANTS } from "@/constants";
import { Button, Caption, Span, Text } from "@/components";
import { useTranslations } from "next-intl";
import type { OrderDocument } from "@/db/schema";

const ORDER_STATUS_STYLES: Record<string, string> = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  shipped:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300",
  delivered:
    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  returned:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300",
};

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  pending:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  paid: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  refunded:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
};

export function useOrderTableColumns(onView: (order: OrderDocument) => void) {
  const t = useTranslations("adminOrders");
  const tActions = useTranslations("actions");
  const { themed } = THEME_CONSTANTS;

  return {
    columns: [
      {
        key: "id",
        header: t("colOrderId"),
        width: "18%",
        render: (order: OrderDocument) => (
          <Span className="font-mono text-xs font-medium truncate max-w-[140px] block">
            {order.id}
          </Span>
        ),
      },
      {
        key: "productTitle",
        header: t("colProduct"),
        sortable: true,
        width: "22%",
        render: (order: OrderDocument) => (
          <div>
            <Text size="sm" weight="medium" className="truncate max-w-[160px]">
              {order.productTitle}
            </Text>
            <Caption>Qty: {order.quantity}</Caption>
          </div>
        ),
      },
      {
        key: "userEmail",
        header: t("colCustomer"),
        sortable: true,
        width: "20%",
        render: (order: OrderDocument) => (
          <div>
            <Text size="sm" weight="medium" className="truncate max-w-[150px]">
              {order.userName}
            </Text>
            <Caption className="truncate max-w-[150px]">
              {order.userEmail}
            </Caption>
          </div>
        ),
      },
      {
        key: "totalPrice",
        header: t("colAmount"),
        sortable: true,
        width: "10%",
        render: (order: OrderDocument) => (
          <Span className="font-semibold text-sm">
            {new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: order.currency ?? "INR",
              maximumFractionDigits: 0,
            }).format(order.totalPrice)}
          </Span>
        ),
      },
      {
        key: "status",
        header: t("colStatus"),
        sortable: true,
        width: "11%",
        render: (order: OrderDocument) => (
          <Span
            className={`px-2 py-1 text-xs font-medium rounded capitalize ${
              ORDER_STATUS_STYLES[order.status] ??
              `${themed.bgSecondary} ${themed.textSecondary}`
            }`}
          >
            {order.status}
          </Span>
        ),
      },
      {
        key: "paymentStatus",
        header: t("colPayment"),
        sortable: true,
        width: "10%",
        render: (order: OrderDocument) => (
          <Span
            className={`px-2 py-1 text-xs font-medium rounded capitalize ${
              PAYMENT_STATUS_STYLES[order.paymentStatus] ??
              `${themed.bgSecondary} ${themed.textSecondary}`
            }`}
          >
            {order.paymentStatus}
          </Span>
        ),
      },
      {
        key: "actions",
        header: t("colDetails"),
        width: "9%",
        render: (order: OrderDocument) => (
          <Button
            onClick={() => onView(order)}
            className="text-indigo-600 dark:text-indigo-400 hover:underline text-sm font-medium"
          >
            {tActions("view")}
          </Button>
        ),
      },
    ],
  };
}
