"use client";

import { useTranslations } from "next-intl";
import { FilterPanel } from "@/components";
import type { FilterConfig, UrlTable } from "@/components";

export const NOTIFICATION_SORT_OPTIONS = [
  { value: "-createdAt", label: "Newest First" },
  { value: "createdAt", label: "Oldest First" },
  { value: "priority", label: "Priority (Low first)" },
  { value: "-priority", label: "Priority (High first)" },
] as const;

export interface NotificationFiltersProps {
  table: UrlTable;
}

export function NotificationFilters({ table }: NotificationFiltersProps) {
  const t = useTranslations("filters");

  const config: FilterConfig[] = [
    {
      type: "facet-single",
      key: "type",
      title: t("type"),
      options: [
        { value: "order_placed", label: t("notificationTypeOrderPlaced") },
        {
          value: "order_confirmed",
          label: t("notificationTypeOrderConfirmed"),
        },
        { value: "order_shipped", label: t("notificationTypeOrderShipped") },
        {
          value: "order_delivered",
          label: t("notificationTypeOrderDelivered"),
        },
        {
          value: "order_cancelled",
          label: t("notificationTypeOrderCancelled"),
        },
        { value: "bid_placed", label: t("notificationTypeBidPlaced") },
        { value: "bid_outbid", label: t("notificationTypeBidOutbid") },
        { value: "bid_won", label: t("notificationTypeBidWon") },
        { value: "bid_lost", label: t("notificationTypeBidLost") },
        { value: "review_posted", label: t("notificationTypeReviewPosted") },
        {
          value: "seller_approved",
          label: t("notificationTypeSellerApproved"),
        },
        {
          value: "seller_rejected",
          label: t("notificationTypeSellerRejected"),
        },
        {
          value: "payment_received",
          label: t("notificationTypePaymentReceived"),
        },
        {
          value: "payout_processed",
          label: t("notificationTypePayoutProcessed"),
        },
        { value: "system", label: t("notificationTypeSystem") },
      ],
      defaultCollapsed: false,
    },
    {
      type: "facet-single",
      key: "priority",
      title: t("priority"),
      options: [
        { value: "low", label: t("notificationPriorityLow") },
        { value: "normal", label: t("notificationPriorityNormal") },
        { value: "high", label: t("notificationPriorityHigh") },
      ],
    },
    {
      type: "facet-single",
      key: "isRead",
      title: t("isRead"),
      options: [
        { value: "true", label: t("booleanRead") },
        { value: "false", label: t("booleanUnread") },
      ],
    },
    {
      type: "facet-single",
      key: "relatedType",
      title: t("relatedType"),
      options: [
        { value: "order", label: t("relatedTypeOrder") },
        { value: "product", label: t("relatedTypeProduct") },
        { value: "bid", label: t("relatedTypeBid") },
        { value: "review", label: t("relatedTypeReview") },
        { value: "blog", label: t("relatedTypeBlog") },
        { value: "user", label: t("relatedTypeUser") },
      ],
    },
  ];

  return <FilterPanel config={config} table={table} />;
}

