"use client";

import { TitleBar as AppkitTitleBar } from "@mohasinac/appkit/features/layout";
import type { TitleBarProps } from "@mohasinac/appkit/features/layout";
import { SITE_CONFIG } from "@/constants/site";
import NotificationBell from "@/components/user/NotificationBell";
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
      notificationSlot={<NotificationBell />}
      {...props}
    />
  );
}
