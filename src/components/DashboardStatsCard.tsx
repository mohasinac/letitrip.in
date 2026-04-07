"use client";

import { Link } from "@/i18n/navigation";
import {
  DashboardStatsCard as PkgDashboardStatsCard,
  type DashboardStatsCardProps as PkgDashboardStatsCardProps,
} from "@mohasinac/ui";

export interface DashboardStatsCardProps extends Omit<
  PkgDashboardStatsCardProps,
  "LinkComponent"
> {}

/**
 * DashboardStatsCard
 *
 * Reusable stat card used in admin, seller, and user portals.
 * Supports default (light) and dark variants, optional trend indicator,
 * and optional link href that makes the whole card a link.
 *
 * @example
 * ```tsx
 * <DashboardStatsCard
 *   label="Total Orders"
 *   value={stats.orders.total}
 *   icon={ShoppingCart}
 *   iconBg="bg-indigo-500/10"
 *   iconColor="text-indigo-600 dark:text-indigo-400"
 *   trend={{ value: 12 }}
 *   variant="dark"
 * />
 * ```
 */
export function DashboardStatsCard(props: DashboardStatsCardProps) {
  return <PkgDashboardStatsCard {...props} LinkComponent={Link} />;
}
