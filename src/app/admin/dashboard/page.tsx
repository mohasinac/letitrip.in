/**
 * Admin Dashboard Page
 * Path: /admin/dashboard
 *
 * Overview statistics and quick actions for admins
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  Button,
  Spinner,
  Heading,
  Text,
  AdminStatsCards,
} from "@/components";
import { useAuth, useAdminStats } from "@/hooks";
import { THEME_CONSTANTS } from "@/constants";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { stats, isLoading, error, refresh } = useAdminStats();
  const { themed, spacing, typography } = THEME_CONSTANTS;

  useEffect(() => {
    if (
      !authLoading &&
      (!user || (user.role !== "admin" && user.role !== "moderator"))
    ) {
      router.push("/");
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
          Retry
        </Button>
      </Card>
    );
  }

  return (
    <div className={`${spacing.stack} w-full`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Heading level={2} variant="primary">
            Dashboard Overview
          </Heading>
          <Text className={`${themed.textSecondary} mt-1`}>
            System statistics and quick actions
          </Text>
        </div>
        <Button onClick={refresh} variant="secondary" size="sm">
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
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      {stats && <AdminStatsCards stats={stats} />}

      {/* Quick Actions */}
      <Card>
        <Heading level={3} variant="primary" className="mb-4">
          Quick Actions
        </Heading>
        <div className={`grid grid-cols-1 md:grid-cols-3 ${spacing.gap.md}`}>
          <Link href="/admin/users" className="block">
            <Button variant="secondary" className="w-full justify-start">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              Manage Users
            </Button>
          </Link>
          <Link href="/admin/users?status=disabled" className="block">
            <Button variant="secondary" className="w-full justify-start">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                />
              </svg>
              Review Disabled Accounts
            </Button>
          </Link>
          <Link href="/admin/content" className="block">
            <Button variant="secondary" className="w-full justify-start">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Manage Content
            </Button>
          </Link>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card>
        <Heading level={3} variant="primary" className="mb-4">
          Recent Activity
        </Heading>
        <div className={spacing.stackSmall}>
          {stats && stats.users.new > 0 && (
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
              <div className="flex-1">
                <Text className="font-medium">New Users</Text>
                <Text className={`${themed.textSecondary} text-sm`}>
                  {stats.users.new} new{" "}
                  {stats.users.new === 1 ? "user" : "users"} registered in the
                  last 30 days
                </Text>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-xl">📊</span>
            </div>
            <div className="flex-1">
              <Text className="font-medium">System Status</Text>
              <Text className={`${themed.textSecondary} text-sm`}>
                All systems operational
              </Text>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
