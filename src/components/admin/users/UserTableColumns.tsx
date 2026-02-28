"use client";

/**
 * useUserTableColumns
 * Path: src/components/admin/users/UserTableColumns.tsx
 *
 * Column definitions hook for the admin users DataTable.
 * Uses RoleBadge, StatusBadge from @/components and formatDate from @/utils.
 */

import { RoleBadge, StatusBadge } from "@/components";
import { useTranslations } from "next-intl";
import { formatDate } from "@/utils";
import type { AdminUser } from "./types";

export function useUserTableColumns(
  onView: (user: AdminUser) => void,
  onToggleBan: (user: AdminUser) => void,
) {
  const t = useTranslations("adminUsers");
  const tActions = useTranslations("actions");

  return {
    columns: [
      {
        key: "displayName",
        header: t("colName"),
        sortable: true,
        width: "20%",
        render: (user: AdminUser) => (
          <div className="flex items-center gap-2">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={(user.displayName || user.email) ?? "User"}
                className="w-8 h-8 rounded-full"
                loading="lazy"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm font-medium">
                {(user.displayName || user.email || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
            <span>{user.displayName || "N/A"}</span>
          </div>
        ),
      },
      {
        key: "email",
        header: t("colEmail"),
        sortable: true,
        width: "25%",
        render: (user: AdminUser) => (
          <div>
            <div>{user.email}</div>
            {!user.emailVerified && (
              <span className="text-xs text-orange-600 dark:text-orange-400">
                {t("emailNotVerified")}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "role",
        header: t("colRole"),
        sortable: true,
        width: "15%",
        render: (user: AdminUser) => <RoleBadge role={user.role} />,
      },
      {
        key: "disabled",
        header: t("colStatus"),
        sortable: true,
        width: "12%",
        render: (user: AdminUser) => (
          <StatusBadge
            status={user.disabled ? "danger" : "active"}
            label={user.disabled ? t("banned") : t("active")}
          />
        ),
      },
      {
        key: "createdAt",
        header: t("colJoined"),
        sortable: true,
        width: "15%",
        render: (user: AdminUser) => formatDate(user.createdAt),
      },
      {
        key: "lastLoginAt",
        header: t("colLastLogin"),
        width: "13%",
        render: (user: AdminUser) =>
          user.lastLoginAt ? formatDate(user.lastLoginAt) : t("never"),
      },
    ],
    actions: (user: AdminUser) => (
      <div className="flex gap-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView(user);
          }}
          className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 text-sm"
        >
          {tActions("view")}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleBan(user);
          }}
          className={`${
            user.disabled
              ? "text-emerald-600 hover:text-emerald-800 dark:text-emerald-400"
              : "text-orange-600 hover:text-orange-800 dark:text-orange-400"
          } text-sm`}
        >
          {user.disabled ? t("unbanUser") : t("banUser")}
        </button>
      </div>
    ),
  };
}
