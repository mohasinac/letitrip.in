"use client";

import { useTranslations } from "next-intl";
import { SectionTabs } from "@/components";
import { ROUTES } from "@/constants";

/**
 * UserTabs Component
 *
 * Navigation tabs for user section pages (Profile, Orders, Wishlist, Addresses, Settings)
 * Thin wrapper around SectionTabs with user-specific config.
 * - Desktop: Full horizontal tab bar with all tabs visible
 * - Mobile: Styled dropdown select with current tab shown
 *
 * @component
 * @example
 * ```tsx
 * <UserTabs />
 * ```
 */
export default function UserTabs() {
  const t = useTranslations("nav");
  const tabs = [
    { href: ROUTES.USER.PROFILE, label: t("myProfile") },
    { href: ROUTES.USER.ORDERS, label: t("myOrders") },
    { href: ROUTES.USER.WISHLIST, label: t("myWishlist") },
    { href: ROUTES.USER.ADDRESSES, label: t("myAddresses") },
    { href: ROUTES.USER.SETTINGS, label: t("settings") },
  ];
  return <SectionTabs tabs={tabs} variant="user" />;
}
