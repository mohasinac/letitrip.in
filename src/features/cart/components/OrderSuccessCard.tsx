"use client";
import { Caption, Grid, Heading, Text, Badge } from "@mohasinac/appkit/ui";

import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import { formatCurrency } from "@mohasinac/appkit/utils";


import React from "react";
import type { OrderDocument } from "@/db/schema";

const { themed, spacing, flex } = THEME_CONSTANTS;

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
  const t = useTranslations("orderSuccess");
  return (
    <div
      className={`${themed.bgSecondary} rounded-xl p-6 ${spacing.stack} mb-6`}
    >
      <Heading level={2} className="mb-0">
        {t("orderDetails")}
      </Heading>

      <div className={`${flex.betweenStart} gap-4`}>
        <div className={spacing.stack}>
          <Caption className="font-medium uppercase tracking-wide">
            {t("orderId")}
          </Caption>
          <Text className={`font-mono font-semibold`} size="sm">
            {order.id}
          </Text>
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
        className={`flex gap-4 p-4 ${themed.bgPrimary} rounded-xl border ${themed.border}`}
      >
        <div className="flex-1 min-w-0">
          <Text weight="semibold" className="truncate">
            {order.productTitle}
          </Text>
          <Text size="sm" variant="secondary">
            {t("qtyLabel")}: {order.quantity} ×{" "}
            {formatCurrency(order.unitPrice, order.currency, "en-IN")}
          </Text>
        </div>
        <Text weight="bold" className="shrink-0">
          {formatCurrency(order.totalPrice, order.currency, "en-IN")}
        </Text>
      </div>

      {/* Payment & shipping info */}
      <Grid cols={2} gap="md">
        <div
          className={`p-4 ${themed.bgPrimary} rounded-xl border ${themed.border} ${spacing.stack}`}
        >
          <Caption className="font-medium uppercase tracking-wide">
            {t("paymentMethod")}
          </Caption>
          <Text weight="medium" className="capitalize">
            {order.paymentMethod === "cod" ? t("cod") : t("onlinePayment")}
          </Text>
          <Badge
            variant={paymentStatusVariant(order.paymentStatus)}
            className="capitalize"
          >
            {order.paymentStatus}
          </Badge>
        </div>
        <div
          className={`p-4 ${themed.bgPrimary} rounded-xl border ${themed.border} ${spacing.stack}`}
        >
          <Caption className="font-medium uppercase tracking-wide">
            {t("shippingTo")}
          </Caption>
          <Text size="sm">{order.shippingAddress}</Text>
        </div>
      </Grid>
    </div>
  );
}

