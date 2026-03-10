"use client";

import { useTranslations } from "next-intl";
import { FilterPanel } from "@/components";
import type { FilterConfig, UrlTable } from "@/components";

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

  const config: FilterConfig[] = [
    {
      type: "facet-single",
      key: "type",
      title: t("type"),
      options: [
        { value: "purchase", label: t("ripcoinTypePurchase") },
        { value: "engage", label: t("ripcoinTypeEngage") },
        { value: "release", label: t("ripcoinTypeRelease") },
        { value: "forfeit", label: t("ripcoinTypeForfeit") },
        { value: "return", label: t("ripcoinTypeReturn") },
        { value: "admin_grant", label: t("ripcoinTypeAdminGrant") },
        { value: "admin_deduct", label: t("ripcoinTypeAdminDeduct") },
      ],
      defaultCollapsed: false,
    },
  ];

  return <FilterPanel config={config} table={table} />;
}
