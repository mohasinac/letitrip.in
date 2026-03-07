"use client";

import { SITE_CONFIG, ROUTES, THEME_CONSTANTS } from "@/constants";
import { useAuth, useCartCount } from "@/hooks";
import { NotificationBell } from "@/features/user";
import { TitleBarLayout } from "./TitleBarLayout";
import { TextLink, Span } from "@/components";
import { Sprout } from "lucide-react";

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
  const cartCount = useCartCount();

  const isDev = process.env.NODE_ENV === "development";

  return (
    <TitleBarLayout
      {...props}
      brandName={SITE_CONFIG.brand.name}
      brandShortName={SITE_CONFIG.brand.shortName}
      logoHref={SITE_CONFIG.nav.home}
      cartHref={SITE_CONFIG.account.cart}
      profileHref={SITE_CONFIG.account.profile}
      user={user}
      cartCount={cartCount}
      notificationSlot={user ? <NotificationBell /> : undefined}
      devSlot={
        isDev ? (
          <TextLink
            href={ROUTES.DEMO.SEED}
            className={`p-2 rounded-xl transition-colors flex items-center gap-1.5 border border-dashed border-yellow-400/60 hover:bg-yellow-400/10 ${THEME_CONSTANTS.colors.iconButton.onPrimary}`}
            aria-label="Seed data (dev only)"
          >
            <Sprout className="w-4 h-4 text-yellow-400" />
            <Span className="text-xs font-semibold text-yellow-400 hidden lg:inline">
              Seed
            </Span>
          </TextLink>
        ) : undefined
      }
    />
  );
}
