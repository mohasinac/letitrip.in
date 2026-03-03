/**
 * RecentActivityCard Component
 * Path: src/components/admin/dashboard/RecentActivityCard.tsx
 *
 * Displays recent activity items on the admin dashboard.
 * Uses useTranslations (next-intl) for all labels.
 */

"use client";

import { UserPlus, Activity } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, Heading, Text } from "@/components";
import { THEME_CONSTANTS } from "@/constants";

const { themed, spacing, enhancedCard, flex } = THEME_CONSTANTS;

interface RecentActivityCardProps {
  stats: {
    users: { total: number; active: number; new: number; disabled: number };
    products: { total: number };
    orders: { total: number };
  };
}

export function RecentActivityCard({ stats }: RecentActivityCardProps) {
  const t = useTranslations("adminDashboard");
  return (
    <Card className={enhancedCard.base}>
      <div className={spacing.cardPadding}>
        <Heading level={3} variant="primary" className="mb-4">
          {t("recentActivity")}
        </Heading>
        <div className={spacing.stackSmall}>
          {stats.users.new > 0 && (
            <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
              <div
                className={`w-10 h-10 bg-emerald-100 dark:bg-emerald-900 rounded-full ${flex.center}`}
              >
                <UserPlus className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <Text className="font-medium">{t("newUsers")}</Text>
                <Text className={`${themed.textSecondary} text-sm`}>
                  {t("newUsersRegistered", { count: stats.users.new })}
                </Text>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 p-3 bg-sky-50 dark:bg-sky-950/30 rounded-lg">
            <div
              className={`w-10 h-10 bg-sky-100 dark:bg-sky-900 rounded-full ${flex.center}`}
            >
              <Activity className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div className="flex-1">
              <Text className="font-medium">{t("systemStatus")}</Text>
              <Text className={`${themed.textSecondary} text-sm`}>
                {t("allSystemsOperational")}
              </Text>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
