"use client";

import { useTranslations } from "next-intl";
import { FilterFacetSection } from "@/components";
import type { UrlTable } from "@/components";

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

  const typeOptions = [
    { value: "order_placed", label: t("notificationTypeOrderPlaced") },
    { value: "order_confirmed", label: t("notificationTypeOrderConfirmed") },
    { value: "order_shipped", label: t("notificationTypeOrderShipped") },
    { value: "order_delivered", label: t("notificationTypeOrderDelivered") },
    { value: "order_cancelled", label: t("notificationTypeOrderCancelled") },
    { value: "bid_placed", label: t("notificationTypeBidPlaced") },
    { value: "bid_outbid", label: t("notificationTypeBidOutbid") },
    { value: "bid_won", label: t("notificationTypeBidWon") },
    { value: "bid_lost", label: t("notificationTypeBidLost") },
    { value: "review_posted", label: t("notificationTypeReviewPosted") },
    { value: "seller_approved", label: t("notificationTypeSellerApproved") },
    { value: "seller_rejected", label: t("notificationTypeSellerRejected") },
    { value: "payment_received", label: t("notificationTypePaymentReceived") },
    { value: "payout_processed", label: t("notificationTypePayoutProcessed") },
    { value: "system", label: t("notificationTypeSystem") },
  ];

  const priorityOptions = [
    { value: "low", label: t("notificationPriorityLow") },
    { value: "normal", label: t("notificationPriorityNormal") },
    { value: "high", label: t("notificationPriorityHigh") },
  ];

  const isReadOptions = [
    { value: "true", label: t("booleanRead") },
    { value: "false", label: t("booleanUnread") },
  ];

  const relatedTypeOptions = [
    { value: "order", label: t("relatedTypeOrder") },
    { value: "product", label: t("relatedTypeProduct") },
    { value: "bid", label: t("relatedTypeBid") },
    { value: "review", label: t("relatedTypeReview") },
    { value: "blog", label: t("relatedTypeBlog") },
    { value: "user", label: t("relatedTypeUser") },
  ];

  const selectedType = table.get("type") ? [table.get("type")] : [];
  const selectedPriority = table.get("priority") ? [table.get("priority")] : [];
  const selectedIsRead = table.get("isRead") ? [table.get("isRead")] : [];
  const selectedRelatedType = table.get("relatedType")
    ? [table.get("relatedType")]
    : [];

  return (
    <div>
      <FilterFacetSection
        title={t("type")}
        options={typeOptions}
        selected={selectedType}
        onChange={(vals) => table.set("type", vals[0] ?? "")}
        searchable={false}
        defaultCollapsed={false}
        selectionMode="single"
      />

      <FilterFacetSection
        title={t("priority")}
        options={priorityOptions}
        selected={selectedPriority}
        onChange={(vals) => table.set("priority", vals[0] ?? "")}
        searchable={false}
        defaultCollapsed={true}
        selectionMode="single"
      />

      <FilterFacetSection
        title={t("isRead")}
        options={isReadOptions}
        selected={selectedIsRead}
        onChange={(vals) => table.set("isRead", vals[0] ?? "")}
        searchable={false}
        defaultCollapsed={true}
        selectionMode="single"
      />

      <FilterFacetSection
        title={t("relatedType")}
        options={relatedTypeOptions}
        selected={selectedRelatedType}
        onChange={(vals) => table.set("relatedType", vals[0] ?? "")}
        searchable={false}
        defaultCollapsed={true}
        selectionMode="single"
      />
    </div>
  );
}
