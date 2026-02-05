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
import { Card, Button } from "@/components";
import { Heading } from "@/components/typography/Typography";
import Text from "@/components/Text";
import { useAuth, useAdminStats } from "@/hooks";
import { THEME_CONSTANTS } from "@/constants/theme";

interface StatsCardProps {
  label: string;
  value: number;
  subtitle?: string;
  subtitleColor?: string;
}

function StatsCard({ label, value, subtitle, subtitleColor }: StatsCardProps) {
  const { themed } = THEME_CONSTANTS;
  return (
    <Card>
      <Text className={themed.textSecondary}>{label}</Text>
      <Heading level={1} variant="primary" className="mt-2">
        {value.toLocaleString()}
      </Heading>
      {subtitle && (
        <Text className={`mt-1 ${subtitleColor || ""}`}>{subtitle}</Text>
      )}
    </Card>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { stats, loading, error, refresh } = useAdminStats();
  const { themed } = THEME_CONSTANTS;

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div
        className={`min-h-screen ${themed.bgPrimary} flex items-center justify-center`}
      >
        <Heading level={2} variant="primary">
          Loading dashboard...
        </Heading>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  if (error) {
    return (
      <div className={`min-h-screen ${themed.bgPrimary} p-8`}>
        <Card>
          <Heading level={3} variant="primary" className="text-red-600">
            {error}
          </Heading>
          <Button onClick={refresh} variant="primary" className="mt-4">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themed.bgPrimary} py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Heading level={1} variant="primary" className="mb-2">
              Admin Dashboard
            </Heading>
            <Text className={themed.textSecondary}>
              System overview and management
            </Text>
          </div>

          <Link href="/admin/users">
            <Button variant="primary">Manage Users</Button>
          </Link>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Users */}
            <StatsCard
              label="Total Users"
              value={stats.users.total}
              subtitle={`+${stats.users.new} new`}
              subtitleColor="text-green-600"
            />
            <StatsCard
              label="Active Users"
              value={stats.users.active}
              subtitle={`${((stats.users.active / stats.users.total) * 100).toFixed(1)}% of total`}
            />
            <StatsCard
              label="Disabled Users"
              value={stats.users.disabled}
              subtitle={`${((stats.users.disabled / stats.users.total) * 100).toFixed(1)}% of total`}
              subtitleColor="text-red-600"
            />
            <StatsCard label="Administrators" value={stats.users.total} />
          </div>
        )}

        {/* Additional Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trips */}
            <Card>
              <Heading level={2} variant="primary" className="mb-4">
                Trips
              </Heading>
              <Heading level={3} variant="primary" className="text-3xl">
                {stats.trips.total.toLocaleString()}
              </Heading>
              <Text className={`mt-2 ${themed.textSecondary}`}>
                Total trips created
              </Text>
            </Card>

            {/* Bookings */}
            <Card>
              <Heading level={2} variant="primary" className="mb-4">
                Bookings
              </Heading>
              <Heading level={3} variant="primary" className="text-3xl">
                {stats.bookings.total.toLocaleString()}
              </Heading>
              <Text className={`mt-2 ${themed.textSecondary}`}>
                Total bookings made
              </Text>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <Heading level={2} variant="primary" className="mb-4">
              Quick Actions
            </Heading>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/admin/users">
                <Button variant="secondary" className="w-full">
                  View All Users
                </Button>
              </Link>
              <Link href="/admin/users?filter=disabled">
                <Button variant="secondary" className="w-full">
                  Review Disabled Accounts
                </Button>
              </Link>
              <Button variant="secondary" onClick={refresh} className="w-full">
                Refresh Statistics
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
