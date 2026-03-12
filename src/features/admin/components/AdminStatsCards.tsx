/**
 * Admin Stats Cards Component
 *
 * Displays key admin statistics using THEME_CONSTANTS.enhancedCard.stat tokens
 * and lucide-react icons. All labels via useTranslations('adminStats').
 */

"use client";

import {
  Users,
  UserCheck,
  UserPlus,
  UserX,
  Package,
  ShoppingCart,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";

const { themed, flex } = THEME_CONSTANTS;
import { Text } from "@/components";
import { formatNumber } from "@/utils";

interface StatsCardsProps {
  stats: {
    users: { total: number; active: number; new: number; disabled: number };
    products: { total: number };
    orders: { total: number };
  };
}

const { enhancedCard, spacing } = THEME_CONSTANTS;

export function AdminStatsCards({ stats }: StatsCardsProps) {
  const t = useTranslations("adminStats");

  const cards = [
    {
      label: t("totalUsers"),
      value: stats.users.total,
      cardClass: enhancedCard.stat.indigo,
      iconClass: "text-indigo-600 dark:text-indigo-400",
      Icon: Users,
    },
    {
      label: t("activeUsers"),
      value: stats.users.active,
      cardClass: enhancedCard.stat.emerald,
      iconClass: "text-emerald-600 dark:text-emerald-400",
      Icon: UserCheck,
    },
    {
      label: t("newUsers"),
      value: stats.users.new,
      cardClass: enhancedCard.stat.teal,
      iconClass: "text-teal-600 dark:text-teal-400",
      Icon: UserPlus,
    },
    {
      label: t("disabledUsers"),
      value: stats.users.disabled,
      cardClass: enhancedCard.stat.rose,
      iconClass: "text-rose-600 dark:text-rose-400",
      Icon: UserX,
    },
    {
      label: t("totalProducts"),
      value: stats.products.total,
      cardClass: enhancedCard.stat.amber,
      iconClass: "text-amber-600 dark:text-amber-400",
      Icon: Package,
    },
    {
      label: t("totalOrders"),
      value: stats.orders.total,
      cardClass: enhancedCard.stat.indigo,
      iconClass: "text-indigo-600 dark:text-indigo-400",
      Icon: ShoppingCart,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.cardClass} hover:shadow-md transition-shadow p-4`}
        >
          <div className={flex.betweenStart}>
            <div className="flex-1">
              <Text
                size="sm"
                weight="medium"
                variant="secondary"
                className="mb-1"
              >
                {card.label}
              </Text>
              <Text weight="bold" className={`text-3xl ${card.iconClass}`}>
                {formatNumber(card.value)}
              </Text>
            </div>
            <div
              className={`p-2 rounded-lg ${themed.bgSecondary} ${card.iconClass}`}
            >
              <card.Icon className="w-6 h-6" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
