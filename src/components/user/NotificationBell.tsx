"use client";

import { useTranslations } from "next-intl";
import { NotificationBell as AppkitNotificationBell } from "@mohasinac/appkit/features/account";
import { useMessage } from "@mohasinac/appkit/react";
import { ROUTES } from "@/constants";
import { TextLink } from "@/components/typography/TextLink";

export function NotificationBell() {
  const { showSuccess, showError } = useMessage();
  const t = useTranslations("notifications");
  const tActions = useTranslations("actions");
  const tLoading = useTranslations("loading");

  return (
    <AppkitNotificationBell
      viewAllHref={ROUTES.USER.NOTIFICATIONS}
      labels={{
        title: t("title"),
        unread: t("unread"),
        markAllRead: t("markAllRead"),
        empty: t("empty"),
        emptyDesc: t("emptyDesc"),
        viewAll: t("viewAll"),
        markRead: t("markRead"),
        viewAction: tActions("view"),
        loading: tLoading("default"),
        error: t("error"),
      }}
      onMarkAllReadSuccess={showSuccess}
      onMarkAllReadError={showError}
      renderLink={({ href, children, onClick, className }) => (
        <TextLink href={href} onClick={onClick} className={className}>
          {children}
        </TextLink>
      )}
    />
  );
}

export default NotificationBell;

