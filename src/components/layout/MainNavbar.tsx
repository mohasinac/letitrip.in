"use client";

import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { MAIN_NAV_ITEMS } from "@/constants";
import { NavbarLayout } from "@mohasinac/appkit/features/layout";

const NAV_TRANSLATION_KEYS = [
  "home",
  "products",
  "auctions",
  "preOrders",
  "categories",
  "stores",
  "events",
  "blog",
  "reviews",
] as const;

/**
 * MainNavbar — thin config shell.
 *
 * Reads the current pathname and nav translation keys, builds the items
 * array from MAIN_NAV_ITEMS and passes everything to the generic
 * NavbarLayout shell.
 */
export default function MainNavbar({
  inline = false,
  hiddenNavItems = [],
}: {
  inline?: boolean;
  hiddenNavItems?: string[];
}) {
  const pathname = usePathname();
  const t = useTranslations("nav");

  const items = MAIN_NAV_ITEMS.filter(
    (item) => !hiddenNavItems.includes(item.key),
  ).map((item, i) => {
    // Re-index after filter to map translation keys correctly
    const keyIdx = NAV_TRANSLATION_KEYS.indexOf(
      item.key as (typeof NAV_TRANSLATION_KEYS)[number],
    );
    return {
      href: item.href,
      label: t(
        keyIdx !== -1 ? NAV_TRANSLATION_KEYS[keyIdx] : NAV_TRANSLATION_KEYS[i],
      ),
      icon: item.icon,
      highlighted: item.highlighted,
    };
  });

  return <NavbarLayout items={items} activeHref={pathname} inline={inline} />;
}
