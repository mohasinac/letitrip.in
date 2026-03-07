"use client";

import { useTranslations } from "next-intl";
import { FilterFacetSection } from "@/components";
import { RangeFilter } from "./RangeFilter";
import { SwitchFilter } from "./SwitchFilter";
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

  const storeStatusOptions = [
    { value: "pending", label: t("storeStatusPending") },
    { value: "approved", label: t("storeStatusApproved") },
    { value: "rejected", label: t("storeStatusRejected") },
  ];

  const selectedRole = table.get("role")
    ? table.get("role").split("|").filter(Boolean)
    : [];
  const selectedStoreStatus = table.get("storeStatus")
    ? table.get("storeStatus").split("|").filter(Boolean)
    : [];

  return (
    <div>
      <FilterFacetSection
        title={t("role")}
        options={roleOptions}
        selected={selectedRole}
        onChange={(vals) => table.set("role", vals.join("|"))}
        searchable={false}
        defaultCollapsed={false}
      />

      <SwitchFilter
        title={t("emailVerified")}
        label={t("showEmailVerifiedOnly")}
        checked={table.get("emailVerified") === "true"}
        onChange={(v) => table.set("emailVerified", v ? "true" : "")}
        defaultCollapsed={true}
      />

      <SwitchFilter
        title={t("accountStatus")}
        label={t("showDisabledOnly")}
        checked={table.get("disabled") === "true"}
        onChange={(v) => table.set("disabled", v ? "true" : "")}
        defaultCollapsed={true}
      />

      <FilterFacetSection
        title={t("storeStatus")}
        options={storeStatusOptions}
        selected={selectedStoreStatus}
        onChange={(vals) => table.set("storeStatus", vals.join("|"))}
        searchable={false}
        defaultCollapsed={true}
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
