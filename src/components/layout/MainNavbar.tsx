"use client";

import { useTranslations } from "next-intl";
import { MAIN_NAV_ITEMS } from "@/constants";
import { MainNavbar as AppkitMainNavbar } from "@mohasinac/appkit/features/layout";

const NAV_KEYS = [
  "home", "products", "auctions", "preOrders",
  "categories", "stores", "events", "blog", "reviews",
] as const;
type NavKey = (typeof NAV_KEYS)[number];

/**
 * MainNavbar - thin consumer adapter.
 * Reads MAIN_NAV_ITEMS + nav translations and delegates to appkit MainNavbar.
 */
export default function MainNavbar({
  inline = false,
  hiddenNavItems = [],
}: {
  inline?: boolean;
  hiddenNavItems?: string[];
}) {
  const t = useTranslations("nav");
  const navItems = MAIN_NAV_ITEMS.map((item, i) => {
    const keyIdx = NAV_KEYS.indexOf(item.key as NavKey);
    return {
      ...item,
      label: t(keyIdx !== -1 ? NAV_KEYS[keyIdx] : NAV_KEYS[i]),
    };
  });

  return (
    <AppkitMainNavbar
      navItems={navItems}
      hiddenNavItems={hiddenNavItems}
      inline={inline}
    />
  );
}
