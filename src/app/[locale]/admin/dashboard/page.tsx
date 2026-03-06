/**
 * Admin Dashboard Page
 * Path: /admin/dashboard
 *
 * Overview statistics and quick actions for admins.
 * Orchestrates AdminPageHeader, AdminStatsCards, QuickActionsGrid, RecentActivityCard.
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  Card,
  Button,
  Heading,
  AdminStatsCards,
  AdminPageHeader,
  RecentActivityCard,
  AdminDashboardSkeleton,
} from "@/components";
import { QuickActionsGrid } from "@/features/admin";
import { useAuth, useAdminStats } from "@/hooks";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { stats, isLoading, error, refresh } = useAdminStats();
  const { spacing } = THEME_CONSTANTS;
  const t = useTranslations("adminDashboard");
  const tActions = useTranslations("actions");

  useEffect(() => {
    if (
      !authLoading &&
      (!user || (user.role !== "admin" && user.role !== "moderator"))
    ) {
      router.push(ROUTES.HOME);
    }
  }, [user, authLoading, router]);

  if (authLoading || isLoading) {
    return <AdminDashboardSkeleton />;
  }

  if (!user || (user.role !== "admin" && user.role !== "moderator")) {
    return null;
  }

  if (error) {
    return (
      <Card>
        <Heading level={3} variant="primary" className="text-red-600">
          {error}
        </Heading>
        <Button onClick={refresh} variant="primary" className="mt-4">
          {tActions("retry")}
        </Button>
      </Card>
    );
  }

  return (
    <div className={`${spacing.stack} w-full`}>
      <AdminPageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actionLabel={tActions("refresh")}
        onAction={refresh}
        actionIcon={
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        }
      />

      {stats && <AdminStatsCards stats={stats} />}

      <QuickActionsGrid />

      {stats && <RecentActivityCard stats={stats} />}
    </div>
  );
}
