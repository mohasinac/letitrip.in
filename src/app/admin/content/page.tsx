"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@/components";
import { Heading, Text } from "@/components/typography";
import { AdminTabs } from "@/components/admin";
import { useAuth } from "@/hooks";
import { THEME_CONSTANTS } from "@/constants/theme";

export default function AdminContentPage() {
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
            Content Management
          </Heading>
          <Text className={`${themed.textSecondary} mt-1`}>
            Manage trips, bookings, and reviews
          </Text>
        </div>

        {/* Content Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Trips */}
          <Card className="hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Heading level={3} variant="primary" className="mb-2">
                  Trips
                </Heading>
                <Text className={themed.textSecondary}>
                  Manage all trip listings
                </Text>
              </div>
              <span className="text-3xl">✈️</span>
            </div>
            <Button variant="primary" className="w-full">
              View Trips
            </Button>
          </Card>

          {/* Bookings */}
          <Card className="hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Heading level={3} variant="primary" className="mb-2">
                  Bookings
                </Heading>
                <Text className={themed.textSecondary}>
                  Manage all bookings
                </Text>
              </div>
              <span className="text-3xl">📅</span>
            </div>
            <Button variant="primary" className="w-full">
              View Bookings
            </Button>
          </Card>

          {/* Reviews */}
          <Card className="hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Heading level={3} variant="primary" className="mb-2">
                  Reviews
                </Heading>
                <Text className={themed.textSecondary}>
                  Moderate user reviews
                </Text>
              </div>
              <span className="text-3xl">⭐</span>
            </div>
            <Button variant="primary" className="w-full">
              View Reviews
            </Button>
          </Card>
        </div>

        {/* Coming Soon Notice */}
        <Card className="bg-blue-50 dark:bg-blue-950/30">
          <div className="text-center py-8">
            <span className="text-5xl mb-4 block">🚧</span>
            <Heading level={3} variant="primary" className="mb-2">
              Content Management Coming Soon
            </Heading>
            <Text className={themed.textSecondary}>
              Advanced content management features are currently under
              development
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
}
