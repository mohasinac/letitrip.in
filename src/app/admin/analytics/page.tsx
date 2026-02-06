"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components";
import { Heading, Text } from "@/components/typography";
import { AdminTabs } from "@/components/admin";
import { useAuth } from "@/hooks";
import { THEME_CONSTANTS } from "@/constants/theme";

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { themed } = THEME_CONSTANTS;

  useEffect(() => {
    if (
      !authLoading &&
      (!user || (user.role !== "admin" && user.role !== "moderator"))
    ) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className={`min-h-screen ${themed.bgPrimary}`}>
        <AdminTabs />
        <div className="container mx-auto px-4 py-6 md:px-6 max-w-7xl flex items-center justify-center min-h-[400px]">
          <Heading level={3} variant="primary">
            Loading...
          </Heading>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== "admin" && user.role !== "moderator")) {
    return null;
  }

  return (
    <div className={`min-h-screen ${themed.bgPrimary}`}>
      <AdminTabs />

      <div className="container mx-auto px-4 py-6 md:px-6 max-w-7xl space-y-6">
        {/* Header */}
        <div>
          <Heading level={2} variant="primary">
            Analytics & Reports
          </Heading>
          <Text className={`${themed.textSecondary} mt-1`}>
            View detailed insights and performance metrics
          </Text>
        </div>

        {/* Analytics Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Analytics */}
          <Card>
            <div className="flex items-start justify-between mb-4">
              <div>
                <Heading level={3} variant="primary" className="mb-2">
                  User Analytics
                </Heading>
                <Text className={themed.textSecondary}>
                  User growth, engagement, and retention metrics
                </Text>
              </div>
              <span className="text-3xl">📊</span>
            </div>
            <div className="space-y-3 mt-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <Text>Growth Rate</Text>
                <Text className="font-semibold text-green-600">+12.5%</Text>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <Text>Active Users (30d)</Text>
                <Text className="font-semibold">Coming Soon</Text>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <Text>Retention Rate</Text>
                <Text className="font-semibold">Coming Soon</Text>
              </div>
            </div>
          </Card>

          {/* Revenue Analytics */}
          <Card>
            <div className="flex items-start justify-between mb-4">
              <div>
                <Heading level={3} variant="primary" className="mb-2">
                  Revenue Analytics
                </Heading>
                <Text className={themed.textSecondary}>
                  Booking trends and revenue reports
                </Text>
              </div>
              <span className="text-3xl">💰</span>
            </div>
            <div className="space-y-3 mt-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <Text>Total Revenue</Text>
                <Text className="font-semibold">Coming Soon</Text>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <Text>Avg. Booking Value</Text>
                <Text className="font-semibold">Coming Soon</Text>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <Text>Conversion Rate</Text>
                <Text className="font-semibold">Coming Soon</Text>
              </div>
            </div>
          </Card>
        </div>

        {/* Coming Soon Notice */}
        <Card className="bg-purple-50 dark:bg-purple-950/30">
          <div className="text-center py-8">
            <span className="text-5xl mb-4 block">📈</span>
            <Heading level={3} variant="primary" className="mb-2">
              Advanced Analytics Coming Soon
            </Heading>
            <Text className={themed.textSecondary}>
              Detailed charts, graphs, and reporting features are currently
              under development
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
}
