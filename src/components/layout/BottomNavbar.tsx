"use client";

import { BottomNavbar as AppkitBottomNavbar } from "@mohasinac/appkit/features/layout";
import type { BottomNavbarProps } from "@mohasinac/appkit/features/layout";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { SITE_CONFIG } from "@mohasinac/appkit/core";
import { useAuth } from "@/contexts/SessionContext";

/**
 * BottomNavbar - thin consumer adapter.
 * Wires letitrip SITE_CONFIG, ROUTES, and authenticated user into the generic appkit BottomNavbar.
 */
export default function BottomNavbar({
  onSearchToggle,
}: Pick<BottomNavbarProps, "onSearchToggle">) {
  const { user } = useAuth();
  const { bottomNav, badge } = THEME_CONSTANTS.colors;
  return (
    <AppkitBottomNavbar
      user={user}
      homeHref={SITE_CONFIG.nav.home}
      shopHref={SITE_CONFIG.nav.products}
      cartHref={SITE_CONFIG.account.cart}
      profileHref={ROUTES.USER.PROFILE}
      loginHref={ROUTES.AUTH.LOGIN}
      onSearchToggle={onSearchToggle}
      activeClassName={bottomNav.active}
      inactiveClassName={bottomNav.inactive}
      iconClassName={bottomNav.icon}
      labelClassName={bottomNav.text}
      getRoleBadgeClass={(role) => {
        const roleText = (badge as Record<string, unknown>)?.roleText as Record<string, string> | undefined;
        return roleText?.[role] ?? roleText?.["user"] ?? "";
      }}
    />
  );
}
