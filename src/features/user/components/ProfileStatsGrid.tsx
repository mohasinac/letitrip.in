"use client";

import { Card } from "@/components";
import { Text, Grid } from "@mohasinac/appkit/ui";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { Link } from "@/i18n/navigation";

/**
 * ProfileStatsGrid Component
 *
 * Display grid of user statistics (orders, wishlist, addresses).
 * Uses THEME_CONSTANTS.card.stat variants from Phase 2.
 *
 * @example
 * ```tsx
 * <ProfileStatsGrid
 *   stats={{
 *     orders: 12,
 *     wishlist: 8,
 *     addresses: 3,
 *   }}
 * />
 * ```
 */

export interface ProfileStats {
  orders: number;
  wishlist: number;
  addresses: number;
}

interface ProfileStatsGridProps {
  stats: ProfileStats;
  className?: string;
}

export function ProfileStatsGrid({
  stats,
  className = "",
}: ProfileStatsGridProps) {
  const { spacing, flex } = THEME_CONSTANTS;

  const statItems = [
    {
      label: "Orders",
      value: stats.orders,
      variant: "stat-indigo" as const,
      href: ROUTES.USER.ORDERS,
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      ),
    },
    {
      label: "Wishlist",
      value: stats.wishlist,
      variant: "stat-rose" as const,
      href: ROUTES.USER.WISHLIST,
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      ),
    },
    {
      label: "Addresses",
      value: stats.addresses,
      variant: "stat-teal" as const,
      href: ROUTES.USER.ADDRESSES,
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <Grid cols="statTiles" className={className}>
      {statItems.map((stat) => (
        <Link key={stat.label} href={stat.href} className="group block">
          <Card
            variant={stat.variant}
            className={`${spacing.cardPadding} cursor-pointer group-hover:shadow-md transition-shadow duration-200`}
          >
            <div className={flex.between}>
              <div>
                <Text
                  className={`text-sm font-medium ${THEME_CONSTANTS.themed.textSecondary}`}
                >
                  {stat.label}
                </Text>
                <Text className="text-3xl font-bold mt-1">{stat.value}</Text>
              </div>
              <div className="text-zinc-400 dark:text-zinc-500">
                {stat.icon}
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </Grid>
  );
}

