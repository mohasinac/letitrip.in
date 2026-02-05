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
    trips: number;
    bookings: number;
  };
}

export function AdminStatsCards({ stats }: StatsCardsProps) {
  const { themed } = THEME_CONSTANTS;

  const cards = [
    { label: "Total Users", value: stats.users.total, color: "text-blue-600" },
    {
      label: "Active Users",
      value: stats.users.active,
      color: "text-green-600",
    },
    { label: "New Users", value: stats.users.new, color: "text-purple-600" },
    { label: "Disabled", value: stats.users.disabled, color: "text-red-600" },
    { label: "Total Trips", value: stats.trips, color: "text-indigo-600" },
    { label: "Total Bookings", value: stats.bookings, color: "text-pink-600" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card) => (
        <Card key={card.label} className={themed.bgSecondary}>
          <Text className={themed.textSecondary}>{card.label}</Text>
          <Heading level={2} className={card.color}>
            {card.value}
          </Heading>
        </Card>
      ))}
    </div>
  );
}
