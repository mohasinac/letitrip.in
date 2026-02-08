"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks";
import { Card, Heading, Text, Button, Spinner } from "@/components";
import UserTabs from "@/components/user/UserTabs";
import { useRouter } from "next/navigation";
import { ROUTES, UI_LABELS } from "@/constants";

export default function UserAddressesPage() {
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
        <div className="flex items-center justify-between">
          <Heading level={3}>My Addresses</Heading>
          <Button
            onClick={() => router.push("/user/addresses/add")}
            className="shadow-md hover:shadow-lg transition-shadow"
          >
            + Add New Address
          </Button>
        </div>

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
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <Heading level={4} className="mb-2">
              No saved addresses
            </Heading>
            <Text className="mb-6">Add an address for faster checkout</Text>
            <Button onClick={() => router.push("/user/addresses/add")}>
              Add Your First Address
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
