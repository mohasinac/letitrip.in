"use client";

import { useTranslations } from "next-intl";
import { FilterFacetSection } from "@/components";
import type { UrlTable } from "./ProductFilters";

export const RIPCOIN_SORT_OPTIONS = [
  { value: "-createdAt", label: "Newest First" },
  { value: "createdAt", label: "Oldest First" },
  { value: "-amount", label: "Highest Amount" },
  { value: "amount", label: "Lowest Amount" },
] as const;

export interface RipCoinFiltersProps {
  table: UrlTable;
}

export function RipCoinFilters({ table }: RipCoinFiltersProps) {
  const t = useTranslations("filters");

  const typeOptions = [
    { value: "purchase", label: t("ripcoinTypePurchase") },
    { value: "engage", label: t("ripcoinTypeEngage") },
    { value: "release", label: t("ripcoinTypeRelease") },
    { value: "forfeit", label: t("ripcoinTypeForfeit") },
    { value: "return", label: t("ripcoinTypeReturn") },
    { value: "admin_grant", label: t("ripcoinTypeAdminGrant") },
    { value: "admin_deduct", label: t("ripcoinTypeAdminDeduct") },
  ];

  const selectedType = table.get("type") ? [table.get("type")] : [];

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
    </div>
  );
}
