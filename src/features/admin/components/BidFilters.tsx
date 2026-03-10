"use client";

import { useTranslations } from "next-intl";
import { FilterPanel } from "@/components";
import type { FilterConfig, UrlTable } from "@/components";

export const BID_SORT_OPTIONS = [
  { value: "-bidAmount", label: "Highest Bid" },
  { value: "bidAmount", label: "Lowest Bid" },
  { value: "-bidDate", label: "Most Recent" },
  { value: "bidDate", label: "Oldest First" },
  { value: "-createdAt", label: "Newest First" },
] as const;

export interface BidFiltersProps {
  table: UrlTable;
}

export function BidFilters({ table }: BidFiltersProps) {
  const t = useTranslations("filters");

  const config: FilterConfig[] = [
    {
      type: "facet-multi",
      key: "status",
      title: t("status"),
      options: [
        { value: "active", label: t("bidStatusActive") },
        { value: "outbid", label: t("bidStatusOutbid") },
        { value: "won", label: t("bidStatusWon") },
        { value: "lost", label: t("bidStatusLost") },
        { value: "cancelled", label: t("bidStatusCancelled") },
      ],
      defaultCollapsed: false,
    },
    {
      type: "switch",
      key: "isWinning",
      title: t("isWinning"),
      label: t("showWinningOnly"),
    },
    {
      type: "range-number",
      minKey: "minAmount",
      maxKey: "maxAmount",
      title: t("amountRange"),
      prefix: "₹",
      showSlider: true,
      minBound: 0,
      maxBound: 1000000,
      step: 1000,
      minPlaceholder: t("minAmount"),
      maxPlaceholder: t("maxAmount"),
    },
  ];

  return <FilterPanel config={config} table={table} />;
}
