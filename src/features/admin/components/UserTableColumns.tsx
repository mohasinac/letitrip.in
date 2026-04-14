"use client";

import { MediaAvatar, RoleBadge } from "@/components";
import type { DataTableColumn } from "@mohasinac/appkit/ui";
import { buildAccountColumns } from "@mohasinac/appkit/features/account";
import { Span, Button, StatusBadge, Row } from "@mohasinac/appkit/ui";
import { useTranslations } from "next-intl";
import { formatDate } from "@/utils";
import type { AdminUser } from "./User.types";
import { THEME_CONSTANTS } from "@/constants";

const { flex } = THEME_CONSTANTS;

type AccountTableUser = Omit<
  AdminUser,
  "displayName" | "email" | "photoURL"
> & {
  displayName?: string;
  email?: string;
  photoURL?: string;
};

export function useUserTableColumns(
  onView: (user: AdminUser) => void,
  onToggleBan: (user: AdminUser) => void,
) {
  const t = useTranslations("adminUsers");
  const tActions = useTranslations("actions");

  const columns = buildAccountColumns<AccountTableUser>({
    overrides: {
      displayName: {
        header: t("colName"),
        sortable: true,
        width: "20%",
        render: (user: AccountTableUser) => (
          <Row gap="sm">
            {user.photoURL ? (
              <MediaAvatar
                src={user.photoURL}
                alt={(user.displayName || user.email) ?? "User"}
                size="sm"
              />
            ) : (
              <div
                className={`w-8 h-8 rounded-full bg-zinc-300 dark:bg-zinc-600 ${flex.center} text-sm font-medium`}
              >
                {(user.displayName || user.email || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
            <Span>{user.displayName || "N/A"}</Span>
          </Row>
        ),
      },
      email: {
        header: t("colEmail"),
        sortable: true,
        width: "25%",
        render: (user: AccountTableUser) => (
          <div>
            <div>{user.email}</div>
            {!user.emailVerified && (
              <Span className="text-xs text-orange-600 dark:text-orange-400">
                {t("emailNotVerified")}
              </Span>
            )}
          </div>
        ),
      },
    },
    omit: ["phone", "createdAt"],
    extras: [
      {
        key: "role",
        header: t("colRole"),
        sortable: true,
        width: "15%",
        render: (user: AccountTableUser) => <RoleBadge role={user.role} />,
      },
      {
        key: "disabled",
        header: t("colStatus"),
        sortable: true,
        width: "12%",
        render: (user: AccountTableUser) => (
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
        render: (user: AccountTableUser) => formatDate(user.createdAt),
      },
      {
        key: "lastLoginAt",
        header: t("colLastLogin"),
        width: "13%",
        render: (user: AccountTableUser) =>
          user.lastLoginAt ? formatDate(user.lastLoginAt) : t("never"),
      },
    ],
  }) as DataTableColumn<AdminUser>[];

  return {
    columns,
    actions: (user: AdminUser) => (
      <div className="flex gap-2">
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onView(user);
          }}
          className="text-primary hover:text-primary/80 text-sm"
        >
          {tActions("view")}
        </Button>
        <Button
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
        </Button>
      </div>
    ),
  };
}
