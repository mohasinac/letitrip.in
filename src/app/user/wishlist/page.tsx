"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks";
import { Card, Heading, Text, Button, Spinner } from "@/components";
import UserTabs from "@/components/user/UserTabs";
import { useRouter } from "next/navigation";
import { ROUTES, UI_LABELS } from "@/constants";
import { SITE_CONFIG } from "@/constants/site";

export default function UserWishlistPage() {
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
    <div className="container mx-auto px-4 py-6 md:px-6 max-w-7xl">
      <UserTabs />

      <div className="space-y-6">
        <Heading level={3}>My Wishlist</Heading>

        {/* Empty State */}
        <Card className="p-12 text-center">
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
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <Heading level={4} className="mb-2">
              Your wishlist is empty
            </Heading>
            <Text className="mb-6">Save items you love to your wishlist</Text>
            <Button onClick={() => router.push(SITE_CONFIG.nav.products)}>
              Browse Products
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
