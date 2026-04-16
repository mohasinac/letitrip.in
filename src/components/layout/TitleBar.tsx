"use client";

import { TitleBar as AppkitTitleBar } from "@mohasinac/appkit/features/layout";
import type { TitleBarProps } from "@mohasinac/appkit/features/layout";
import { SITE_CONFIG } from "@mohasinac/appkit/core";
import { NotificationBell } from "@mohasinac/appkit/features/account";
import { UI_LABELS, ROUTES } from "@/constants";
import { useAuth } from "@/contexts/SessionContext";

type LocalTitleBarProps = Omit<
  TitleBarProps,
  "brandName" | "brandShortName" | "logoHref" | "cartHref" | "profileHref" | "promotionsHref" | "notificationSlot" | "user"
>;

/**
 * TitleBar - thin consumer adapter.
 * Injects SITE_CONFIG + user into the generic appkit TitleBar component.
 */
export default function TitleBar(props: LocalTitleBarProps) {
  const { user } = useAuth();
  return (
    <AppkitTitleBar
      brandName={SITE_CONFIG.brand.name}
      brandShortName={SITE_CONFIG.brand.shortName}
      logoHref={SITE_CONFIG.nav.home}
      cartHref={SITE_CONFIG.account.cart}
      profileHref={SITE_CONFIG.account.profile}
      promotionsHref={SITE_CONFIG.nav.promotions}
      user={user}
      notificationSlot={
        <NotificationBell
          viewAllHref={ROUTES.USER.NOTIFICATIONS}
          labels={{
            title: UI_LABELS.NOTIFICATIONS.TITLE,
            unread: UI_LABELS.NOTIFICATIONS.UNREAD,
            markAllRead: UI_LABELS.NOTIFICATIONS.MARK_ALL_READ,
            empty: UI_LABELS.NOTIFICATIONS.NO_NOTIFICATIONS,
            emptyDesc: UI_LABELS.NOTIFICATIONS.NO_NOTIFICATIONS_DESC,
            viewAll: UI_LABELS.NOTIFICATIONS.VIEW_ALL,
            markRead: UI_LABELS.NOTIFICATIONS.MARK_READ,
            viewAction: "View",
            loading: UI_LABELS.NOTIFICATIONS.LOADING,
            error: UI_LABELS.NOTIFICATIONS.ERROR,
          }}
        />
      }
      {...props}
    />
  );
}
