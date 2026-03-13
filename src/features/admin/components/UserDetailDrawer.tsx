/**
 * UserDetailDrawer Component
 * Path: src/components/admin/users/UserDetailDrawer.tsx
 *
 * Side drawer showing detailed user info with role change/ban/delete actions.
 * Uses RoleBadge, StatusBadge, SideDrawer, Button from @/components.
 */

"use client";

import {
  SideDrawer,
  Button,
  RoleBadge,
  StatusBadge,
  Heading,
  Text,
  Caption,
  Label,
  AvatarDisplay,
  Grid,
} from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { formatDateTime } from "@/utils";
import { useTranslations } from "next-intl";
import type { AdminUser } from "./User.types";

const { spacing, themed } = THEME_CONSTANTS;

interface UserDetailDrawerProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onRoleChange: (user: AdminUser, newRole: string) => void;
  onToggleBan: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
  onAdjustRC: (user: AdminUser) => void;
}

const ROLES = ["user", "seller", "moderator", "admin"] as const;

export function UserDetailDrawer({
  user,
  isOpen,
  onClose,
  onRoleChange,
  onToggleBan,
  onDelete,
  onAdjustRC,
}: UserDetailDrawerProps) {
  const t = useTranslations("adminUsers");
  const tRC = useTranslations("adminRC");
  const tRoles = useTranslations("roles");
  if (!user) return null;

  return (
    <SideDrawer
      isOpen={isOpen}
      onClose={onClose}
      title={t("detail")}
      mode="view"
      side="right"
    >
      <div className={spacing.stack}>
        {/* User Avatar + Info */}
        <div className={`flex items-start gap-4`}>
          <AvatarDisplay
            cropData={
              user.photoURL
                ? { url: user.photoURL, position: { x: 50, y: 50 }, zoom: 1 }
                : null
            }
            size="xl"
            alt={(user.displayName || user.email) ?? "User"}
            displayName={user.displayName || undefined}
            email={user.email || undefined}
          />
          <div className="flex-1">
            <Heading level={2} className="text-xl">
              {user.displayName || t("noName")}
            </Heading>
            <Text variant="secondary">{user.email}</Text>
            <div className="flex gap-2 mt-2 flex-wrap">
              <RoleBadge role={user.role} />
              <StatusBadge
                status={user.disabled ? "danger" : "active"}
                label={user.disabled ? t("banned") : t("active")}
              />
              {!user.emailVerified && (
                <StatusBadge status="warning" label={t("emailNotVerified")} />
              )}
            </div>
          </div>
        </div>

        {/* Metadata Grid */}
        <Grid className={`grid-cols-2 pt-4 border-t ${themed.border}`} gap="md">
          <div>
            <Caption>{t("fields.userId")}</Caption>
            <Text className="font-mono break-all" size="sm">
              {user.uid}
            </Text>
          </div>
          <div>
            <Caption>{t("fields.loginCount")}</Caption>
            <Text>
              {t("loginTimesCount", { count: user.metadata?.loginCount || 0 })}
            </Text>
          </div>
          <div>
            <Caption>{t("fields.joined")}</Caption>
            <Text>{formatDateTime(user.createdAt)}</Text>
          </div>
          <div>
            <Caption>{t("fields.lastLogin")}</Caption>
            <Text>
              {user.lastLoginAt ? formatDateTime(user.lastLoginAt) : t("never")}
            </Text>
          </div>
        </Grid>

        {/* RC */}
        <div className={`pt-4 border-t ${themed.border}`}>
          <div className={`${THEME_CONSTANTS.flex.between} mb-2`}>
            <Label>{tRC("balance")}</Label>
            <Text weight="semibold">
              {(user.rcBalance ?? 0).toLocaleString()} {tRC("coins")}
            </Text>
          </div>
          <Button
            onClick={() => onAdjustRC(user)}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {tRC("adjustButton")}
          </Button>
        </div>

        {/* Role Change */}
        <div className={`pt-4 border-t ${themed.border}`}>
          <Label className="block mb-2">{t("changeRole")}</Label>
          <div className="flex gap-2 flex-wrap">
            {ROLES.map((role) => (
              <Button
                key={role}
                onClick={() => onRoleChange(user, role)}
                disabled={user.role === role}
                variant={user.role === role ? "primary" : "outline"}
                size="sm"
              >
                {tRoles(role)}
              </Button>
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
            {user.disabled ? t("unbanUser") : t("banUser")}
          </Button>
          <Button
            onClick={() => onDelete(user)}
            variant="secondary"
            className="text-red-600 hover:text-red-700"
          >
            {t("deleteUser")}
          </Button>
        </div>
      </div>
    </SideDrawer>
  );
}
