"use client";

import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS, ROUTES, SITE_CONFIG } from "@/constants";
import { useAuth } from "@/hooks";
import { Li, Span } from "@mohasinac/appkit/ui";
import { AvatarDisplay, TextLink, Button } from "@/components";
import { Home, ShoppingBag } from "lucide-react";
import { BottomNavLayout } from "./BottomNavLayout";
import NavItem from "./NavItem";

/**
 * BottomNavbar Component
 *
 * The mobile navigation bar fixed at the bottom of the screen.
 * Shows exactly 5 items: Home, Products, Search, Cart, Profile.
 * Additional navigation (Auctions, Stores, Events, Blog, etc.) is accessible via the sidebar.
 * Visible only on mobile devices (hidden on desktop where MainNavbar is shown).
 *
 * @component
 * @example
 * ```tsx
 * <BottomNavbar onSearchToggle={() => setSearchOpen(!searchOpen)} />
 * ```
 */

interface BottomNavbarProps {
  onSearchToggle?: () => void;
}

export default function BottomNavbar({ onSearchToggle }: BottomNavbarProps) {
  const { themed, typography, flex, colors } = THEME_CONSTANTS;
  const pathname = usePathname();
  const { user } = useAuth();
  const t = useTranslations("nav");

  /** Shared 20% width style for each of the 5 equal slots */
  const itemStyle = { width: "20%" } as const;

  return (
    <BottomNavLayout ariaLabel={t("mobileNav")}>
      {/* 1 — Home */}
      <Li className="flex-1" style={itemStyle}>
        <NavItem
          href={SITE_CONFIG.nav.home}
          label={t("home")}
          icon={<Home className="w-5 h-5" />}
          isActive={pathname === SITE_CONFIG.nav.home}
          variant="vertical"
        />
      </Li>

      {/* 2 — Products */}
      <Li className="flex-1" style={itemStyle}>
        <NavItem
          href={SITE_CONFIG.nav.products}
          label={t("products")}
          icon={<ShoppingBag className="w-5 h-5" />}
          isActive={pathname === SITE_CONFIG.nav.products}
          variant="vertical"
        />
      </Li>

      {/* 3 — Search */}
      <Li className="flex-1" style={itemStyle}>
        <Button
          variant="ghost"
          onClick={onSearchToggle}
          className={`${flex.centerCol} gap-1 w-full h-full transition-colors duration-200 ${colors.bottomNav.inactive}`}
          aria-label={t("search")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <Span className={`${typography.xs} leading-none`}>{t("search")}</Span>
        </Button>
      </Li>

      {/* 4 — Cart */}
      <Li className="flex-1" style={itemStyle}>
        <TextLink
          href={SITE_CONFIG.account.cart}
          variant="inherit"
          className={`${flex.centerCol} gap-1 w-full h-full transition-colors duration-200 relative ${
            pathname === SITE_CONFIG.account.cart
              ? colors.bottomNav.active
              : colors.bottomNav.inactive
          }`}
          aria-label={t("cart")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <Span className={`${typography.xs} leading-none`}>{t("cart")}</Span>
        </TextLink>
      </Li>

      {/* 5 — Profile */}
      <Li className="flex-1" style={itemStyle}>
        {user ? (
          <TextLink
            href={ROUTES.USER.PROFILE}
            variant="inherit"
            className={`${flex.centerCol} gap-1 w-full h-full transition-colors duration-200 ${
              pathname === ROUTES.USER.PROFILE
                ? colors.bottomNav.active
                : colors.bottomNav.inactive
            }`}
            aria-label={t("profile")}
          >
            <AvatarDisplay
              cropData={
                user.avatarMetadata ||
                (user.photoURL
                  ? {
                      url: user.photoURL,
                      position: { x: 50, y: 50 },
                      zoom: 1,
                    }
                  : null)
              }
              size="sm"
              alt={user.displayName || "User"}
              displayName={user.displayName}
              email={user.email}
            />
            <Span
              className={`text-[7px] font-semibold uppercase leading-none ${
                THEME_CONSTANTS.badge.roleText[user.role] ||
                THEME_CONSTANTS.badge.roleText.user
              }`}
            >
              {user.role || "user"}
            </Span>
          </TextLink>
        ) : (
          <NavItem
            href={ROUTES.AUTH.LOGIN}
            label={t("profile")}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            }
            isActive={pathname === ROUTES.AUTH.LOGIN}
            variant="vertical"
          />
        )}
      </Li>
    </BottomNavLayout>
  );
}
