"use client";

import { useAuth } from "@/hooks";
import { useQuery } from "@tanstack/react-query";
import { getSellerAnalyticsAction } from "@/actions";
import { hasAnyRole } from "@/helpers";
import type { SellerAnalyticsSummary } from "../components/SellerAnalyticsStats";
import type { MonthEntry } from "../components/SellerRevenueChart";
import type { TopProduct } from "../components/SellerTopProducts";

export interface SellerAnalyticsResponse {
  summary: SellerAnalyticsSummary;
  revenueByMonth: MonthEntry[];
  topProducts: TopProduct[];
}

/**
 * useSellerAnalytics
 * Fetches seller analytics via Server Action (2-hop).
 * Only fetches when the user is authenticated and has the seller or admin role.
 */
export function useSellerAnalytics() {
  const { user, loading } = useAuth();
  const enabled =
    !loading && !!user && hasAnyRole(user.role, ["seller", "admin"]);

  const { data, isLoading, error } = useQuery<SellerAnalyticsResponse>({
    queryKey: ["seller-analytics", user?.uid ?? ""],
    queryFn: async () => {
      const r = await getSellerAnalyticsAction();
      return {
        summary: {
          totalOrders: r.totalOrders,
          totalRevenue: r.totalRevenue,
          totalProducts: r.totalProducts,
          publishedProducts: r.publishedProducts,
        },
        revenueByMonth: r.monthlyRevenue as MonthEntry[],
        topProducts: [] as TopProduct[],
      };
    },
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
