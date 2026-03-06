"use client";

import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { MAIN_NAV_ITEMS } from "@/constants";
import { NavbarLayout } from "./NavbarLayout";

const NAV_TRANSLATION_KEYS = [
  "home",
  "products",
  "auctions",
  "categories",
  "stores",
  "events",
  "blog",
  "promotions",
  "reviews",
] as const;

/**
 * MainNavbar — thin config shell.
 *
 * Reads the current pathname and nav translation keys, builds the items
 * array from MAIN_NAV_ITEMS and passes everything to the generic
 * NavbarLayout shell.
 */
export default function MainNavbar() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  const items = MAIN_NAV_ITEMS.map((item, i) => ({
    href: item.href,
    label: t(NAV_TRANSLATION_KEYS[i]),
    icon: item.icon,
  }));

  return <NavbarLayout items={items} activeHref={pathname} />;
}
