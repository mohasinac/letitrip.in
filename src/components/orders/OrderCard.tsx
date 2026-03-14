"use client";

import { useCallback } from "react";
import { Package } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  Button,
  Caption,
  Card,
  Span,
  StatusBadge,
  Text,
  TextLink,
} from "@/components";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { formatCurrency, formatDate } from "@/utils";
import type { OrderDocument } from "@/db/schema";

const { spacing, typography } = THEME_CONSTANTS;

const STATUS_MAP: Record<
  string,
  "pending" | "info" | "active" | "success" | "danger"
> = {
  pending: "pending",
  confirmed: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "danger",
  returned: "danger",
};

export interface OrderCardProps {
  order: OrderDocument;
  className?: string;
  /** "grid" (default): stacked card. "list": compact horizontal row. */
  variant?: "grid" | "list";
  selectable?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
}

export function OrderCard({
  order,
  className = "",
  variant = "grid",
  selectable = false,
  isSelected = false,
  onSelect,
}: OrderCardProps) {
  const t = useTranslations("orders");
  const router = useRouter();

  const orderId = order.id ?? "";
  const shortId = `#${orderId.slice(0, 8).toUpperCase()}`;
  const status = STATUS_MAP[order.status] ?? "pending";
  const statusLabel =
    order.status.charAt(0).toUpperCase() + order.status.slice(1);
  const isDelivered = order.status === "delivered";
  const isShipped = order.status === "shipped";

  const detailHref = ROUTES.USER.ORDER_DETAIL(orderId);

  const handleSelect = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onSelect?.(orderId, !isSelected);
    },
    [orderId, isSelected, onSelect],
  );

  const isListVariant = variant === "list";

  return (
    <Card
      className={`relative overflow-hidden transition-all duration-200 hover:shadow-md ${isSelected ? "ring-2 ring-primary-500 dark:ring-primary-400" : ""} ${className}`}
    >
      {/* ── SELECTION CHECKBOX ── */}
      {selectable && (
        <button
          type="button"
          aria-label={isSelected ? "Deselect order" : "Select order"}
          aria-pressed={isSelected}
          onClick={handleSelect}
          className={`absolute top-3 left-3 z-10 w-6 h-6 rounded border-2 ${THEME_CONSTANTS.flex.center} transition-colors ${
            isSelected
              ? "bg-primary-700 border-primary-700"
              : "bg-white/90 border-zinc-300 dark:bg-slate-800/90 dark:border-slate-600 hover:border-primary-400"
          }`}
        >
          {isSelected && (
            <svg
              className="w-3.5 h-3.5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </button>
      )}

      <div
        className={`${spacing.cardPadding} flex ${isListVariant ? "flex-row items-center justify-between" : "flex-col"} gap-4`}
      >
        {/* ── ORDER ICON + ID + DATE ── */}
        <div
          className={`flex items-start gap-3 ${selectable ? "pl-8" : ""} ${isListVariant ? "flex-1 min-w-0" : ""}`}
        >
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-lg bg-zinc-100 dark:bg-slate-800 ${THEME_CONSTANTS.flex.center}`}
          >
            <Package className="w-5 h-5 text-zinc-500 dark:text-slate-400" />
          </div>
          <div className={`${spacing.stackSmall} min-w-0`}>
            <TextLink href={detailHref} className="leading-tight">
              <Text weight="semibold" className="truncate">
                {order.productTitle ?? shortId}
              </Text>
            </TextLink>
            <Caption className={`${typography.caption} font-mono`}>
              {t("orderNumber")} {shortId}
            </Caption>
            <Caption className={typography.caption}>
              {t("placedOn")} {formatDate(order.orderDate)}
            </Caption>
            {order.items && order.items.length > 1 && (
              <Caption className={typography.caption}>
                {t("items")}: <Span weight="medium">{order.items.length}</Span>
              </Caption>
            )}
          </div>
        </div>

        {/* ── STATUS + PRICE + ACTIONS ── */}
        <div
          className={`flex ${isListVariant ? "items-center gap-4 flex-shrink-0" : "flex-col gap-3"}`}
        >
          <div
            className={`flex ${isListVariant ? "items-center gap-4" : "items-center justify-between flex-wrap gap-3"}`}
          >
            <StatusBadge status={status} label={statusLabel} />
            <Text weight="semibold" className="tabular-nums">
              {formatCurrency(order.totalPrice, order.currency)}
            </Text>
          </div>

          {/* ── ACTION BUTTONS ── */}
          <div className={`flex items-center flex-wrap gap-2`}>
            {(isShipped || isDelivered) && order.trackingNumber && (
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 min-w-0 text-xs px-2 sm:text-xs sm:px-2"
                onClick={() => router.push(ROUTES.USER.ORDER_TRACK(orderId))}
              >
                {t("trackOrder")}
              </Button>
            )}
            {isDelivered && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1 min-w-0 text-xs px-2 sm:text-xs sm:px-2"
                onClick={() =>
                  router.push(
                    `${ROUTES.PUBLIC.PRODUCT_DETAIL(order.productId ?? "")}#write-review`,
                  )
                }
              >
                {t("writeReview")}
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              className="flex-1 min-w-0 text-xs px-2 sm:text-xs sm:px-2"
              onClick={() => router.push(detailHref)}
            >
              {t("viewOrder")}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
