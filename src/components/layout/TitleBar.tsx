"use client";

import { SITE_CONFIG, THEME_CONSTANTS } from "@/constants";
import { useAuth, useCartCount } from "@/hooks";
import { NotificationBell } from "@/components";
import { TitleBarLayout } from "./TitleBarLayout";

/**
 * TitleBar Component
 *
 * Thin config shell. Reads domain data (useAuth, SITE_CONFIG) and forwards
 * to the generic TitleBarLayout primitive.
 *
 * @component
 * @example
 * ```tsx
 * <TitleBar
 *   onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
 *   sidebarOpen={sidebarOpen}
 *   onSearchToggle={() => setSearchOpen(!searchOpen)}
 *   searchOpen={searchOpen}
 * />
 * ```
 */

interface TitleBarProps {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
  onSearchToggle: () => void;
  searchOpen: boolean;
  isDark: boolean;
  onToggleTheme: () => void;
}

export default function TitleBar(props: TitleBarProps) {
  const { user } = useAuth();
  const cartCount = useCartCount();
  const { isDark, onToggleTheme, ...rest } = props;

  return (
    <TitleBarLayout
      {...rest}
      brandName={SITE_CONFIG.brand.name}
      brandShortName={SITE_CONFIG.brand.shortName}
      logoHref={SITE_CONFIG.nav.home}
      cartHref={SITE_CONFIG.account.cart}
      profileHref={SITE_CONFIG.account.profile}
      promotionsHref={SITE_CONFIG.nav.promotions}
      user={user}
      cartCount={cartCount}
      notificationSlot={<>{user && <NotificationBell />}</>}
      isDark={isDark}
      onToggleTheme={onToggleTheme}
    />
  );
}
