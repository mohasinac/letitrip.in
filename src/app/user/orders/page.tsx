"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks";
import { Card, Heading, Text, Button, Spinner } from "@/components";
import UserTabs from "@/components/user/UserTabs";
import { useRouter } from "next/navigation";
import { ROUTES, UI_LABELS } from "@/constants";
import { SITE_CONFIG } from "@/constants/site";

export default function UserOrdersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" label={UI_LABELS.LOADING.DEFAULT} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="w-full">
      <UserTabs />

      <div className="space-y-6 mt-6">
        <Heading level={3}>My Orders</Heading>

        {/* Empty State - Modern Card */}
        <Card className="p-12 text-center shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="max-w-md mx-auto">
            <svg
              className="w-24 h-24 mx-auto mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <Heading level={4} className="mb-2">
              No orders yet
            </Heading>
            <Text className="mb-6">Start shopping to see your orders here</Text>
            <Button onClick={() => router.push(SITE_CONFIG.nav.products)}>
              Browse Products
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
