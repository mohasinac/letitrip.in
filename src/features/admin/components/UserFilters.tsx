"use client";

import { useTranslations } from "next-intl";
import { FilterPanel } from "@/components";
import type { FilterConfig, UrlTable } from "@/components";

export const USER_SORT_OPTIONS = [
  { value: "-createdAt", label: "Newest First" },
  { value: "createdAt", label: "Oldest First" },
  { value: "displayName", label: "Name A–Z" },
  { value: "-displayName", label: "Name Z–A" },
  { value: "role", label: "Role" },
  { value: "-updatedAt", label: "Recently Updated" },
] as const;

export interface UserFiltersProps {
  table: UrlTable;
}

export function UserFilters({ table }: UserFiltersProps) {
  const t = useTranslations("filters");

  const config: FilterConfig[] = [
    {
      type: "facet-multi",
      key: "role",
      title: t("role"),
      options: [
        { value: "user", label: t("roleUser") },
        { value: "seller", label: t("roleSeller") },
        { value: "moderator", label: t("roleModerator") },
        { value: "admin", label: t("roleAdmin") },
      ],
      defaultCollapsed: false,
    },
    {
      type: "switch",
      key: "emailVerified",
      title: t("emailVerified"),
      label: t("showEmailVerifiedOnly"),
    },
    {
      type: "switch",
      key: "disabled",
      title: t("accountStatus"),
      label: t("showDisabledOnly"),
    },
    {
      type: "facet-multi",
      key: "storeStatus",
      title: t("storeStatus"),
      options: [
        { value: "pending", label: t("storeStatusPending") },
        { value: "approved", label: t("storeStatusApproved") },
        { value: "rejected", label: t("storeStatusRejected") },
      ],
    },
    {
      type: "range-date",
      fromKey: "createdFrom",
      toKey: "createdTo",
      title: t("dateRange"),
      minPlaceholder: t("minDate"),
      maxPlaceholder: t("maxDate"),
    },
  ];

  return <FilterPanel config={config} table={table} />;
}
