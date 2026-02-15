/**
 * UserDetailDrawer Component
 * Path: src/components/admin/users/UserDetailDrawer.tsx
 *
 * Side drawer showing detailed user info with role change/ban/delete actions.
 * Uses RoleBadge, StatusBadge, SideDrawer, Button from @/components.
 */

"use client";

import { SideDrawer, Button, RoleBadge, StatusBadge } from "@/components";
import { THEME_CONSTANTS, UI_LABELS } from "@/constants";
import { formatDateTime } from "@/utils";
import type { AdminUser } from "./types";

const { spacing, themed, typography } = THEME_CONSTANTS;

interface UserDetailDrawerProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onRoleChange: (user: AdminUser, newRole: string) => void;
  onToggleBan: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
}

const ROLES = ["user", "seller", "moderator", "admin"] as const;

export function UserDetailDrawer({
  user,
  isOpen,
  onClose,
  onRoleChange,
  onToggleBan,
  onDelete,
}: UserDetailDrawerProps) {
  if (!user) return null;

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={UI_LABELS.ADMIN.USERS.DETAIL}
      mode="view"
    >
      <div className={spacing.stack}>
        {/* User Avatar + Info */}
        <div className={`flex items-start ${spacing.gap.md}`}>
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={(user.displayName || user.email) ?? "User"}
              className="w-20 h-20 rounded-full"
              loading="lazy"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-2xl font-medium">
              {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <h2 className={`text-xl font-semibold ${themed.textPrimary}`}>
              {user.displayName || "No name"}
            </h2>
            <p className={themed.textSecondary}>{user.email}</p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <RoleBadge role={user.role} />
              <StatusBadge
                status={user.disabled ? "danger" : "active"}
                label={
                  user.disabled
                    ? UI_LABELS.ADMIN.USERS.BANNED
                    : UI_LABELS.ADMIN.USERS.ACTIVE
                }
              />
              {!user.emailVerified && (
                <StatusBadge status="warning" label="Email Not Verified" />
              )}
            </div>
          </div>
        </div>

        {/* Metadata Grid */}
        <div
          className={`grid grid-cols-2 gap-4 pt-4 border-t ${themed.border}`}
        >
          <div>
            <label className={typography.caption}>User ID</label>
            <p className={`${themed.textPrimary} font-mono text-sm break-all`}>
              {user.uid}
            </p>
          </div>
          <div>
            <label className={typography.caption}>Login Count</label>
            <p className={themed.textPrimary}>
              {user.metadata?.loginCount || 0} times
            </p>
          </div>
          <div>
            <label className={typography.caption}>Joined</label>
            <p className={themed.textPrimary}>
              {formatDateTime(user.createdAt)}
            </p>
          </div>
          <div>
            <label className={typography.caption}>Last Login</label>
            <p className={themed.textPrimary}>
              {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : "Never"}
            </p>
          </div>
        </div>

        {/* Role Change */}
        <div className={`pt-4 border-t ${themed.border}`}>
          <label className={`block ${typography.label} mb-2`}>
            {UI_LABELS.ADMIN.USERS.CHANGE_ROLE}
          </label>
          <div className="flex gap-2 flex-wrap">
            {ROLES.map((role) => (
              <button
                key={role}
                onClick={() => onRoleChange(user, role)}
                disabled={user.role === role}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  user.role === role
                    ? "bg-indigo-600 text-white cursor-not-allowed"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className={`flex gap-2 pt-4 border-t ${themed.border}`}>
          <Button
            onClick={() => onToggleBan(user)}
            variant="secondary"
            className={user.disabled ? "text-emerald-600" : "text-orange-600"}
          >
            {user.disabled
              ? UI_LABELS.ADMIN.USERS.UNBAN_USER
              : UI_LABELS.ADMIN.USERS.BAN_USER}
          </Button>
          <Button
            onClick={() => onDelete(user)}
            variant="secondary"
            className="text-red-600 hover:text-red-700"
          >
            {UI_LABELS.ADMIN.USERS.DELETE_USER}
          </Button>
        </div>
      </div>
    </SideDrawer>
  );
}
