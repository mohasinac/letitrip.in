"use client";

import { useTranslations } from "next-intl";
import { FilterFacetSection, RangeFilter, SwitchFilter } from "@/components";
import type { UrlTable } from "@/components";

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

  const statusOptions = [
    { value: "active", label: t("bidStatusActive") },
    { value: "outbid", label: t("bidStatusOutbid") },
    { value: "won", label: t("bidStatusWon") },
    { value: "lost", label: t("bidStatusLost") },
    { value: "cancelled", label: t("bidStatusCancelled") },
  ];

  const selectedStatus = table.get("status")
    ? table.get("status").split("|").filter(Boolean)
    : [];

  return (
    <div>
      <FilterFacetSection
        title={t("status")}
        options={statusOptions}
        selected={selectedStatus}
        onChange={(vals) => table.set("status", vals.join("|"))}
        searchable={false}
        defaultCollapsed={false}
      />

      <SwitchFilter
        title={t("isWinning")}
        label={t("showWinningOnly")}
        checked={table.get("isWinning") === "true"}
        onChange={(v) => table.set("isWinning", v ? "true" : "")}
      />

      <RangeFilter
        title={t("amountRange")}
        type="number"
        minValue={table.get("minAmount")}
        maxValue={table.get("maxAmount")}
        onMinChange={(v) => table.set("minAmount", v)}
        onMaxChange={(v) => table.set("maxAmount", v)}
        prefix="₹"
        showSlider
        minBound={0}
        maxBound={1000000}
        step={1000}
        minPlaceholder={t("minAmount")}
        maxPlaceholder={t("maxAmount")}
        defaultCollapsed={true}
      />
    </div>
  );
}
