"use client";

import { SectionTabs } from "@/components";
import { SELLER_TAB_ITEMS } from "@/constants";

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
  return <SectionTabs tabs={SELLER_TAB_ITEMS} variant="admin" />;
}
