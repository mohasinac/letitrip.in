"use client";

import { SectionTabs } from "@/components";
import { USER_TAB_ITEMS } from "@/constants";

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
  return <SectionTabs tabs={USER_TAB_ITEMS} variant="user" />;
}
