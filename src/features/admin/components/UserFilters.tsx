/**
 * UserFilters Component
 * Path: src/components/admin/users/UserFilters.tsx
 *
 * Search + role filter + status tab bar for the admin users page.
 * Uses AdminFilterBar, FormField, and UI_LABELS from @/constants.
 */

"use client";

import { AdminFilterBar, FormField, Button } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import type { UserTab } from "./User.types";

const { themed } = THEME_CONSTANTS;

interface UserFiltersProps {
  activeTab: UserTab;
  onTabChange: (tab: UserTab) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  roleFilter: string;
  onRoleFilterChange: (role: string) => void;
  isAdminsTab: boolean;
}

export function UserFilters({
  activeTab,
  onTabChange,
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  isAdminsTab,
}: UserFiltersProps) {
  const t = useTranslations("adminUsers");
  const tRoles = useTranslations("roles");
  const tActions = useTranslations("actions");
  const tForm = useTranslations("form");

  const TABS: { key: UserTab; label: string }[] = [
    { key: "all", label: t("all") },
    { key: "active", label: t("active") },
    { key: "banned", label: t("banned") },
    { key: "admins", label: t("admins") },
  ];

  const ROLE_OPTIONS = [
    { value: "all", label: tRoles("all") },
    { value: "user", label: tRoles("user") },
    { value: "seller", label: tRoles("seller") },
    { value: "moderator", label: tRoles("moderator") },
    { value: "admin", label: tRoles("admin") },
  ];

  return (
    <>
      {/* Status Tab Bar */}
      <div className={`border-b ${themed.border}`}>
        <div className="flex gap-4">
          {TABS.map((tab) => (
            <Button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                  : `border-transparent ${themed.textSecondary} hover:text-gray-900 dark:hover:text-gray-200`
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Search + Role Filter */}
      <AdminFilterBar columns={2}>
        <FormField
          name="userSearch"
          label={tActions("search")}
          type="text"
          value={searchTerm}
          onChange={onSearchChange}
          placeholder={t("searchPlaceholder")}
        />
        <FormField
          name="roleFilter"
          label={tForm("roleFilter")}
          type="select"
          value={roleFilter}
          onChange={onRoleFilterChange}
          options={ROLE_OPTIONS}
          disabled={isAdminsTab}
        />
      </AdminFilterBar>
    </>
  );
}
