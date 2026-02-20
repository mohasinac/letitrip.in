import React from "react";
import { Badge } from "@/components/ui";
import { THEME_CONSTANTS, UI_LABELS } from "@/constants";
import { formatCurrency } from "@/utils";
import type { OrderDocument } from "@/db/schema";

const LABELS = UI_LABELS.ORDER_SUCCESS_PAGE;
const { themed, spacing, typography, borderRadius } = THEME_CONSTANTS;

function orderStatusVariant(
  s: OrderDocument["status"],
): React.ComponentProps<typeof Badge>["variant"] {
  const map: Record<string, React.ComponentProps<typeof Badge>["variant"]> = {
    pending: "pending",
    confirmed: "success",
    processing: "info",
    shipped: "info",
    delivered: "active",
    cancelled: "danger",
  };
  return map[s] ?? "default";
}

function paymentStatusVariant(
  s: OrderDocument["paymentStatus"],
): React.ComponentProps<typeof Badge>["variant"] {
  const map: Record<string, React.ComponentProps<typeof Badge>["variant"]> = {
    pending: "pending",
    paid: "success",
    failed: "danger",
    refunded: "warning",
  };
  return map[s] ?? "default";
}

interface OrderSuccessCardProps {
  order: OrderDocument;
}

export function OrderSuccessCard({ order }: OrderSuccessCardProps) {
  return (
    <div
      className={`${themed.bgSecondary} ${borderRadius.xl} p-6 ${spacing.stack} mb-6`}
    >
      <h2 className={`${typography.h4} ${themed.textPrimary}`}>
        {LABELS.ORDER_DETAILS}
      </h2>

      <div className="flex items-start justify-between gap-4">
        <div className={spacing.stack}>
          <p
            className={`text-xs font-medium uppercase tracking-wide ${themed.textSecondary}`}
          >
            {LABELS.ORDER_ID_LABEL}
          </p>
          <p
            className={`font-mono text-sm font-semibold ${themed.textPrimary}`}
          >
            {order.id}
          </p>
        </div>
        <Badge
          variant={orderStatusVariant(order.status)}
          className="capitalize"
        >
          {order.status}
        </Badge>
      </div>

      {/* Product */}
      <div
        className={`flex gap-4 p-4 ${themed.bgPrimary} ${borderRadius.xl} border ${themed.border}`}
      >
        <div className="flex-1 min-w-0">
          <p className={`font-semibold ${themed.textPrimary} truncate`}>
            {order.productTitle}
          </p>
          <p className={`text-sm ${themed.textSecondary}`}>
            {LABELS.QTY_LABEL}: {order.quantity} ×{" "}
            {formatCurrency(order.unitPrice, order.currency, "en-IN")}
          </p>
        </div>
        <p className={`font-bold ${themed.textPrimary} shrink-0`}>
          {formatCurrency(order.totalPrice, order.currency, "en-IN")}
        </p>
      </div>

      {/* Payment & shipping info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className={`p-4 ${themed.bgPrimary} ${borderRadius.xl} border ${themed.border} ${spacing.stack}`}
        >
          <p
            className={`text-xs font-medium uppercase tracking-wide ${themed.textSecondary}`}
          >
            {LABELS.PAYMENT_METHOD_LABEL}
          </p>
          <p className={`font-medium capitalize ${themed.textPrimary}`}>
            {order.paymentMethod === "cod"
              ? LABELS.COD_LABEL
              : LABELS.ONLINE_PAYMENT_LABEL}
          </p>
          <Badge
            variant={paymentStatusVariant(order.paymentStatus)}
            className="capitalize"
          >
            {order.paymentStatus}
          </Badge>
        </div>
        <div
          className={`p-4 ${themed.bgPrimary} ${borderRadius.xl} border ${themed.border} ${spacing.stack}`}
        >
          <p
            className={`text-xs font-medium uppercase tracking-wide ${themed.textSecondary}`}
          >
            {LABELS.SHIPPING_TO_LABEL}
          </p>
          <p className={`text-sm ${themed.textPrimary}`}>
            {order.shippingAddress}
          </p>
        </div>
      </div>
    </div>
  );
}
