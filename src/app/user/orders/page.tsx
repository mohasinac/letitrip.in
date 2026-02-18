"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks";
import { Heading, Spinner, EmptyState } from "@/components";
import { useRouter } from "next/navigation";
import { ROUTES, UI_LABELS, THEME_CONSTANTS } from "@/constants";

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

  // TODO: Wire up useApiQuery once hooks support optional auth headers
  // const { data: orders, isLoading } = useApiQuery(API_ENDPOINTS.ORDERS.LIST);

  return (
    <div className={THEME_CONSTANTS.spacing.stack}>
      <Heading level={3}>{UI_LABELS.USER.ORDERS.TITLE}</Heading>

      {/* Empty State */}
      <EmptyState
        icon={
          <svg
            className="w-24 h-24 mx-auto text-gray-400"
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
        }
        title={UI_LABELS.USER.ORDERS.EMPTY}
        description={UI_LABELS.USER.ORDERS.EMPTY_SUBTITLE}
        actionLabel={UI_LABELS.USER.ORDERS.BROWSE_PRODUCTS}
        onAction={() => router.push(ROUTES.PUBLIC.PRODUCTS)}
      />
    </div>
  );
}
