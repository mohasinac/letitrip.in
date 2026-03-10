"use client";

import { useTranslations } from "next-intl";
import { FilterPanel } from "@/components";
import type { FilterConfig, UrlTable } from "@/components";

export const PAYOUT_SORT_OPTIONS = [
  { value: "-requestedAt", label: "Most Recent Request" },
  { value: "requestedAt", label: "Oldest Request" },
  { value: "-processedAt", label: "Most Recently Processed" },
  { value: "-amount", label: "Highest Amount" },
  { value: "amount", label: "Lowest Amount" },
  { value: "sellerName", label: "Seller Name A–Z" },
  { value: "-createdAt", label: "Newest First" },
] as const;

export interface PayoutFiltersProps {
  table: UrlTable;
}

export function PayoutFilters({ table }: PayoutFiltersProps) {
  const t = useTranslations("filters");

  const config: FilterConfig[] = [
    {
      type: "facet-multi",
      key: "status",
      title: t("status"),
      options: [
        { value: "pending", label: t("payoutStatusPending") },
        { value: "processing", label: t("payoutStatusProcessing") },
        { value: "completed", label: t("payoutStatusCompleted") },
        { value: "failed", label: t("payoutStatusFailed") },
      ],
      defaultCollapsed: false,
    },
    {
      type: "facet-multi",
      key: "paymentMethod",
      title: t("payoutPaymentMethod"),
      options: [
        { value: "bank_transfer", label: t("payoutMethodBankTransfer") },
        { value: "upi", label: t("payoutMethodUpi") },
      ],
    },
    {
      type: "range-number",
      minKey: "minAmount",
      maxKey: "maxAmount",
      title: t("amountRange"),
      prefix: "₹",
      showSlider: true,
      minBound: 0,
      maxBound: 500000,
      step: 500,
      minPlaceholder: t("minAmount"),
      maxPlaceholder: t("maxAmount"),
    },
  ];

  return <FilterPanel config={config} table={table} />;
}
