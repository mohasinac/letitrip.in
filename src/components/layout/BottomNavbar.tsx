"use client";

import { BottomNavbar as AppkitBottomNavbar } from "@mohasinac/appkit/features/layout";
import type { BottomNavbarProps } from "@mohasinac/appkit/features/layout";
import { SITE_CONFIG, ROUTES, THEME_CONSTANTS } from "@/constants";
import { useAuth } from "@/hooks";

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
      getRoleBadgeClass={(role) =>
        (badge.roleText as Record<string, string>)[role] ??
        badge.roleText.user
      }
    />
  );
}
