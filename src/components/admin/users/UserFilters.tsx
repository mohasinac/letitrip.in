/**
 * UserFilters Component
 * Path: src/components/admin/users/UserFilters.tsx
 *
 * Search + role filter + status tab bar for the admin users page.
 * Uses AdminFilterBar, FormField, and UI_LABELS from @/constants.
 */

"use client";

import { AdminFilterBar, FormField } from "@/components";
import { UI_LABELS, THEME_CONSTANTS } from "@/constants";
import type { UserTab } from "./types";

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

const TABS: { key: UserTab; label: string }[] = [
  { key: "all", label: UI_LABELS.ADMIN.USERS.ALL },
  { key: "active", label: UI_LABELS.ADMIN.USERS.ACTIVE },
  { key: "banned", label: UI_LABELS.ADMIN.USERS.BANNED },
  { key: "admins", label: UI_LABELS.ADMIN.USERS.ADMINS },
];

const ROLE_OPTIONS = [
  { value: "all", label: "All Roles" },
  { value: "user", label: "User" },
  { value: "seller", label: "Seller" },
  { value: "moderator", label: "Moderator" },
  { value: "admin", label: "Admin" },
];

export function UserFilters({
  activeTab,
  onTabChange,
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  isAdminsTab,
}: UserFiltersProps) {
  return (
    <>
      {/* Status Tab Bar */}
      <div className={`border-b ${themed.border}`}>
        <div className="flex gap-4">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                  : `border-transparent ${themed.textSecondary} hover:text-gray-900 dark:hover:text-gray-200`
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search + Role Filter */}
      <AdminFilterBar columns={2}>
        <FormField
          name="userSearch"
          label={UI_LABELS.ACTIONS.SEARCH}
          type="text"
          value={searchTerm}
          onChange={onSearchChange}
          placeholder={UI_LABELS.ADMIN.USERS.SEARCH_PLACEHOLDER}
        />
        <FormField
          name="roleFilter"
          label="Role Filter"
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
