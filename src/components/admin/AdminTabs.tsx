"use client";

import { SectionTabs } from "@/components";
import { ADMIN_TAB_ITEMS } from "@/constants";

/**
 * AdminTabs Component
 *
 * Navigation tabs for admin section pages (Dashboard, Users, Site, Carousel, etc.)
 * Thin wrapper around SectionTabs with admin-specific config.
 * - Desktop: Full horizontal tab bar with all tabs visible
 * - Mobile: Styled dropdown select with current tab shown
 *
 * @component
 * @example
 * ```tsx
 * <AdminTabs />
 * ```
 */
export default function AdminTabs() {
  return <SectionTabs tabs={ADMIN_TAB_ITEMS} variant="admin" />;
}
