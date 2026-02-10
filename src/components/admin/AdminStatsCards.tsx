/**
 * Admin Stats Cards Component
 */

import { Card, Heading, Text } from "@/components";
import { THEME_CONSTANTS } from "@/constants";

interface StatsCardsProps {
  stats: {
    users: { total: number; active: number; new: number; disabled: number };
    products: { total: number };
    orders: { total: number };
  };
}

export function AdminStatsCards({ stats }: StatsCardsProps) {
  const { themed } = THEME_CONSTANTS;

  const cards = [
    {
      label: "Total Users",
      value: stats.users.total,
      color: "text-blue-600",
      icon: "👥",
    },
    {
      label: "Active Users",
      value: stats.users.active,
      color: "text-green-600",
      icon: "✅",
    },
    {
      label: "New Users",
      value: stats.users.new,
      color: "text-purple-600",
      icon: "🆕",
    },
    {
      label: "Disabled",
      value: stats.users.disabled,
      color: "text-red-600",
      icon: "🚫",
    },
    {
      label: "Total Products",
      value: stats.products.total,
      color: "text-indigo-600",
      icon: "📦",
    },
    {
      label: "Total Orders",
      value: stats.orders.total,
      color: "text-pink-600",
      icon: "🛒",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <Card
          key={card.label}
          className={`${themed.bgSecondary} hover:shadow-md transition-shadow`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <Text className={`${themed.textSecondary} text-sm mb-2`}>
                {card.label}
              </Text>
              <Heading level={2} className={card.color}>
                {card.value.toLocaleString()}
              </Heading>
            </div>
            <span className="text-3xl">{card.icon}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}
