"use client";

import { useTranslations } from "next-intl";
import { FilterFacetSection } from "@/components";
import { RangeFilter } from "./RangeFilter";
import type { UrlTable } from "./ProductFilters";

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

  const roleOptions = [
    { value: "user", label: t("roleUser") },
    { value: "seller", label: t("roleSeller") },
    { value: "moderator", label: t("roleModerator") },
    { value: "admin", label: t("roleAdmin") },
  ];

  const emailVerifiedOptions = [
    { value: "true", label: t("booleanVerified") },
    { value: "false", label: t("booleanUnverified") },
  ];

  const disabledOptions = [
    { value: "false", label: t("booleanActive") },
    { value: "true", label: t("booleanDisabled") },
  ];

  const storeStatusOptions = [
    { value: "pending", label: t("storeStatusPending") },
    { value: "approved", label: t("storeStatusApproved") },
    { value: "rejected", label: t("storeStatusRejected") },
  ];

  const selectedRole = table.get("role") ? [table.get("role")] : [];
  const selectedEmailVerified = table.get("emailVerified")
    ? [table.get("emailVerified")]
    : [];
  const selectedDisabled = table.get("disabled") ? [table.get("disabled")] : [];
  const selectedStoreStatus = table.get("storeStatus")
    ? [table.get("storeStatus")]
    : [];

  return (
    <div>
      <FilterFacetSection
        title={t("role")}
        options={roleOptions}
        selected={selectedRole}
        onChange={(vals) => table.set("role", vals[0] ?? "")}
        searchable={false}
        defaultCollapsed={false}
        selectionMode="single"
      />

      <FilterFacetSection
        title={t("emailVerified")}
        options={emailVerifiedOptions}
        selected={selectedEmailVerified}
        onChange={(vals) => table.set("emailVerified", vals[0] ?? "")}
        searchable={false}
        defaultCollapsed={true}
        selectionMode="single"
      />

      <FilterFacetSection
        title={t("accountStatus")}
        options={disabledOptions}
        selected={selectedDisabled}
        onChange={(vals) => table.set("disabled", vals[0] ?? "")}
        searchable={false}
        defaultCollapsed={true}
        selectionMode="single"
      />

      <FilterFacetSection
        title={t("storeStatus")}
        options={storeStatusOptions}
        selected={selectedStoreStatus}
        onChange={(vals) => table.set("storeStatus", vals[0] ?? "")}
        searchable={false}
        defaultCollapsed={true}
        selectionMode="single"
      />

      <RangeFilter
        title={t("dateRange")}
        type="date"
        minValue={table.get("createdFrom")}
        maxValue={table.get("createdTo")}
        onMinChange={(v) => table.set("createdFrom", v)}
        onMaxChange={(v) => table.set("createdTo", v)}
        minPlaceholder={t("minDate")}
        maxPlaceholder={t("maxDate")}
        defaultCollapsed={true}
      />
    </div>
  );
}
