"use client";

import { useTranslations } from "next-intl";
import { FilterFacetSection } from "@/components";
import { RangeFilter } from "./RangeFilter";
import type { UrlTable } from "./ProductFilters";

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

  const isWinningOptions = [
    { value: "true", label: t("booleanWinning") },
    { value: "false", label: t("booleanNotWinning") },
  ];

  const selectedStatus = table.get("status") ? [table.get("status")] : [];
  const selectedIsWinning = table.get("isWinning")
    ? [table.get("isWinning")]
    : [];

  return (
    <div>
      <FilterFacetSection
        title={t("status")}
        options={statusOptions}
        selected={selectedStatus}
        onChange={(vals) => table.set("status", vals[0] ?? "")}
        searchable={false}
        defaultCollapsed={false}
        selectionMode="single"
      />

      <FilterFacetSection
        title={t("isWinning")}
        options={isWinningOptions}
        selected={selectedIsWinning}
        onChange={(vals) => table.set("isWinning", vals[0] ?? "")}
        searchable={false}
        defaultCollapsed={true}
        selectionMode="single"
      />

      <RangeFilter
        title={t("amountRange")}
        type="number"
        minValue={table.get("minAmount")}
        maxValue={table.get("maxAmount")}
        onMinChange={(v) => table.set("minAmount", v)}
        onMaxChange={(v) => table.set("maxAmount", v)}
        prefix="₹"
        minPlaceholder={t("minAmount")}
        maxPlaceholder={t("maxAmount")}
        defaultCollapsed={true}
      />
    </div>
  );
}
