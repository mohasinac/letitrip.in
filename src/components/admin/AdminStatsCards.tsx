/**
 * Admin Stats Cards Component
 *
 * Displays key admin statistics using THEME_CONSTANTS.enhancedCard.stat tokens
 * and lucide-react icons. No hardcoded strings — all labels from UI_LABELS.
 */

import {
  Users,
  UserCheck,
  UserPlus,
  UserX,
  Package,
  ShoppingCart,
} from "lucide-react";
import { THEME_CONSTANTS, UI_LABELS } from "@/constants";

interface StatsCardsProps {
  stats: {
    users: { total: number; active: number; new: number; disabled: number };
    products: { total: number };
    orders: { total: number };
  };
}

const { enhancedCard, spacing } = THEME_CONSTANTS;

const STAT_CARDS = (stats: StatsCardsProps["stats"]) => [
  {
    label: UI_LABELS.ADMIN.STATS.TOTAL_USERS,
    value: stats.users.total,
    cardClass: enhancedCard.stat.indigo,
    iconClass: "text-indigo-600 dark:text-indigo-400",
    Icon: Users,
  },
  {
    label: UI_LABELS.ADMIN.STATS.ACTIVE_USERS,
    value: stats.users.active,
    cardClass: enhancedCard.stat.emerald,
    iconClass: "text-emerald-600 dark:text-emerald-400",
    Icon: UserCheck,
  },
  {
    label: UI_LABELS.ADMIN.STATS.NEW_USERS,
    value: stats.users.new,
    cardClass: enhancedCard.stat.teal,
    iconClass: "text-teal-600 dark:text-teal-400",
    Icon: UserPlus,
  },
  {
    label: UI_LABELS.ADMIN.STATS.DISABLED_USERS,
    value: stats.users.disabled,
    cardClass: enhancedCard.stat.rose,
    iconClass: "text-rose-600 dark:text-rose-400",
    Icon: UserX,
  },
  {
    label: UI_LABELS.ADMIN.STATS.TOTAL_PRODUCTS,
    value: stats.products.total,
    cardClass: enhancedCard.stat.amber,
    iconClass: "text-amber-600 dark:text-amber-400",
    Icon: Package,
  },
  {
    label: UI_LABELS.ADMIN.STATS.TOTAL_ORDERS,
    value: stats.orders.total,
    cardClass: enhancedCard.stat.indigo,
    iconClass: "text-indigo-600 dark:text-indigo-400",
    Icon: ShoppingCart,
  },
];

export function AdminStatsCards({ stats }: StatsCardsProps) {
  const cards = STAT_CARDS(stats);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.cardClass} hover:shadow-md transition-shadow ${spacing.padding.md}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {card.label}
              </p>
              <p className={`text-3xl font-bold ${card.iconClass}`}>
                {card.value.toLocaleString()}
              </p>
            </div>
            <div
              className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-800 ${card.iconClass}`}
            >
              <card.Icon className="w-6 h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
