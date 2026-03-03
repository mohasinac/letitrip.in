"use client";

import { Card, Text } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";

interface EventStatsBannerProps {
  totalEntries: number;
  approvedEntries: number;
  flaggedEntries: number;
  pendingEntries: number;
  isLoading?: boolean;
}

const { themed, spacing } = THEME_CONSTANTS;

export function EventStatsBanner({
  totalEntries,
  approvedEntries,
  flaggedEntries,
  pendingEntries,
  isLoading = false,
}: EventStatsBannerProps) {
  const t = useTranslations("adminEvents");

  const stats = [
    {
      label: "Total Entries",
      value: totalEntries,
      color: "text-violet-600 dark:text-violet-400",
    },
    {
      label: t("approve"),
      value: approvedEntries,
      color: "text-green-600 dark:text-green-400",
    },
    {
      label: "Pending",
      value: pendingEntries,
      color: "text-yellow-600 dark:text-yellow-400",
    },
    {
      label: t("flag"),
      value: flaggedEntries,
      color: "text-red-600 dark:text-red-400",
    },
  ];

  return (
    <div
      className={`grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 ${spacing.gap.md}`}
    >
      {stats.map(({ label, value, color }) => (
        <Card key={label} className={spacing.cardPadding}>
          <Text className={`text-sm ${themed.textSecondary}`}>{label}</Text>
          <Text className={`text-2xl font-bold mt-1 ${color}`}>
            {isLoading ? "—" : value}
          </Text>
        </Card>
      ))}
    </div>
  );
}
