/**
 * Admin Dashboard Page
 * Path: /admin/dashboard
 *
 * Overview statistics and quick actions for admins.
 * Orchestrates AdminPageHeader, AdminStatsCards, QuickActionsGrid, RecentActivityCard.
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  Button,
  Spinner,
  Heading,
  AdminStatsCards,
  AdminPageHeader,
} from "@/components";
import {
  QuickActionsGrid,
  RecentActivityCard,
} from "@/components/admin/dashboard";
import { useAuth, useAdminStats } from "@/hooks";
import { UI_LABELS, ROUTES, THEME_CONSTANTS } from "@/constants";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { stats, isLoading, error, refresh } = useAdminStats();
  const { spacing } = THEME_CONSTANTS;

  useEffect(() => {
    if (
      !authLoading &&
      (!user || (user.role !== "admin" && user.role !== "moderator"))
    ) {
      router.push(ROUTES.HOME);
    }
  }, [user, authLoading, router]);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="xl" variant="primary" />
      </div>
    );
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
          {UI_LABELS.ACTIONS.RETRY}
        </Button>
      </Card>
    );
  }

  return (
    <div className={`${spacing.stack} w-full`}>
      <AdminPageHeader
        title={UI_LABELS.ADMIN.DASHBOARD.TITLE}
        subtitle={UI_LABELS.ADMIN.DASHBOARD.SUBTITLE}
        actionLabel={UI_LABELS.ACTIONS.REFRESH}
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
