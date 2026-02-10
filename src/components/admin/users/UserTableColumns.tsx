/**
 * UserTableColumns
 * Path: src/components/admin/users/UserTableColumns.tsx
 *
 * Column definitions for the admin users DataTable.
 * Uses RoleBadge, StatusBadge from @/components and formatDate from @/utils.
 */

import { RoleBadge, StatusBadge } from "@/components";
import { UI_LABELS } from "@/constants";
import { formatDate } from "@/utils";
import type { AdminUser } from "./types";

export function getUserTableColumns(
  onView: (user: AdminUser) => void,
  onToggleBan: (user: AdminUser) => void,
) {
  return {
    columns: [
      {
        key: "displayName",
        header: UI_LABELS.TABLE.NAME,
        sortable: true,
        width: "20%",
        render: (user: AdminUser) => (
          <div className="flex items-center gap-2">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || user.email}
                className="w-8 h-8 rounded-full"
                loading="lazy"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm font-medium">
                {(user.displayName || user.email).charAt(0).toUpperCase()}
              </div>
            )}
            <span>{user.displayName || "N/A"}</span>
          </div>
        ),
      },
      {
        key: "email",
        header: UI_LABELS.FORM.EMAIL,
        sortable: true,
        width: "25%",
        render: (user: AdminUser) => (
          <div>
            <div>{user.email}</div>
            {!user.emailVerified && (
              <span className="text-xs text-orange-600 dark:text-orange-400">
                {UI_LABELS.STATUS.EMAIL_NOT_VERIFIED}
              </span>
            )}
          </div>
        ),
      },
      {
        key: "role",
        header: "Role",
        sortable: true,
        width: "15%",
        render: (user: AdminUser) => <RoleBadge role={user.role} />,
      },
      {
        key: "disabled",
        header: UI_LABELS.TABLE.STATUS,
        sortable: true,
        width: "12%",
        render: (user: AdminUser) => (
          <StatusBadge
            status={user.disabled ? "danger" : "active"}
            label={
              user.disabled
                ? UI_LABELS.ADMIN.USERS.BANNED
                : UI_LABELS.ADMIN.USERS.ACTIVE
            }
          />
        ),
      },
      {
        key: "createdAt",
        header: "Joined",
        sortable: true,
        width: "15%",
        render: (user: AdminUser) => formatDate(user.createdAt),
      },
      {
        key: "lastLoginAt",
        header: "Last Login",
        width: "13%",
        render: (user: AdminUser) =>
          user.lastLoginAt ? formatDate(user.lastLoginAt) : "Never",
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
          {UI_LABELS.ACTIONS.VIEW}
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
          {user.disabled
            ? UI_LABELS.ADMIN.USERS.UNBAN_USER
            : UI_LABELS.ADMIN.USERS.BAN_USER}
        </button>
      </div>
    ),
  };
}
