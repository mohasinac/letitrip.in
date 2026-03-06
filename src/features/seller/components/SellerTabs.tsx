"use client";

import { useTranslations } from "next-intl";
import { SectionTabs } from "@/components";
import { ROUTES } from "@/constants";

/**
 * SellerTabs Component
 *
 * Navigation tabs for seller section pages (Dashboard, Products, Auctions, Sales).
 * Thin wrapper around SectionTabs with seller-specific config.
 * - Desktop: Full horizontal tab bar with all tabs visible
 * - Mobile: Styled dropdown select with current tab shown
 *
 * @component
 * @example
 * ```tsx
 * <SellerTabs />
 * ```
 */
export default function SellerTabs() {
  const t = useTranslations("nav");
  const tabs = [
    { href: ROUTES.SELLER.DASHBOARD, label: t("dashboard") },
    { href: ROUTES.SELLER.PRODUCTS, label: t("myProducts") },
    { href: ROUTES.SELLER.AUCTIONS, label: t("myAuctions") },
    { href: ROUTES.SELLER.ORDERS, label: t("mySales") },
    { href: ROUTES.SELLER.STORE, label: t("myStore") },
  ];
  return <SectionTabs tabs={tabs} variant="admin" />;
}
