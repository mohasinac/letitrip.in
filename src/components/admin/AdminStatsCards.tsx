/**
 * Admin Stats Cards Component
 */

import { Card } from "@/components";
import { Heading } from "@/components/typography/Typography";
import Text from "@/components/Text";
import { THEME_CONSTANTS } from "@/constants/theme";

interface StatsCardsProps {
  stats: {
    users: { total: number; active: number; new: number; disabled: number };
    trips: { total: number };
    bookings: { total: number };
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
      label: "Total Trips",
      value: stats.trips.total,
      color: "text-indigo-600",
      icon: "✈️",
    },
    {
      label: "Total Bookings",
      value: stats.bookings.total,
      color: "text-pink-600",
      icon: "📅",
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
