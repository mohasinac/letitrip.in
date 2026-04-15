"use client";

import { useTranslations } from "next-intl";
import {
  DashboardStatsGrid,
  type DashboardStats,
} from "@mohasinac/appkit/features/admin";

interface StatsCardsProps {
  stats: {
    users: { total: number; active: number; new: number; disabled: number };
    products: { total: number };
    orders: { total: number };
  };
}

export function AdminStatsCards({ stats }: StatsCardsProps) {
  const t = useTranslations("adminStats");

  const mappedStats: DashboardStats = {
    totalUsers: stats.users.total,
    totalProducts: stats.products.total,
    totalOrders: stats.orders.total,
    pendingReviews: stats.users.disabled,
    newUsersToday: stats.users.new,
  };

  return (
    <DashboardStatsGrid
      stats={mappedStats}
      labels={{
        totalUsers: t("totalUsers"),
        totalProducts: t("totalProducts"),
        totalOrders: t("totalOrders"),
        pendingReviews: t("disabledUsers"),
        newUsersToday: t("newUsers"),
      }}
    />
  );
}

