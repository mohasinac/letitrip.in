"use client";

import { SITE_CONFIG } from "@/constants";
import { useAuth } from "@/hooks";
import { NotificationBell } from "@/features/user";
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
}

export default function TitleBar(props: TitleBarProps) {
  const { user } = useAuth();

  return (
    <TitleBarLayout
      {...props}
      brandName={SITE_CONFIG.brand.name}
      brandShortName={SITE_CONFIG.brand.shortName}
      logoHref={SITE_CONFIG.nav.home}
      cartHref={SITE_CONFIG.account.cart}
      profileHref={SITE_CONFIG.account.profile}
      user={user}
      notificationSlot={user ? <NotificationBell /> : undefined}
    />
  );
}
