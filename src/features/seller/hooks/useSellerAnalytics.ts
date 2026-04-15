"use client";

import { useAuth } from "@/hooks";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/appkit/http";
import { hasAnyRole } from "@mohasinac/appkit/features/auth";
import type {
  SellerAnalyticsSummary,
  SellerAnalyticsMonthEntry,
  SellerAnalyticsTopProduct,
} from "@mohasinac/appkit/features/seller";

export interface SellerAnalyticsResponse {
  summary: SellerAnalyticsSummary;
  revenueByMonth: SellerAnalyticsMonthEntry[];
  topProducts: SellerAnalyticsTopProduct[];
}

/**
 * useSellerAnalytics
 * Fetches seller analytics via GET /api/seller/analytics.
 * Only fetches when the user is authenticated and has the seller or admin role.
 */
export function useSellerAnalytics() {
  const { user, loading } = useAuth();
  const enabled =
    !loading && !!user && hasAnyRole(user.role, ["seller", "admin"]);

  const { data, isLoading, error } = useQuery<SellerAnalyticsResponse>({
    queryKey: ["seller-analytics", user?.uid ?? ""],
    queryFn: () =>
      apiClient.get<SellerAnalyticsResponse>("/api/seller/analytics"),
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  return {
    summary: data?.summary,
    revenueByMonth: data?.revenueByMonth ?? [],
    topProducts: data?.topProducts ?? [],
    isLoading: loading || isLoading,
    error,
  };
}

