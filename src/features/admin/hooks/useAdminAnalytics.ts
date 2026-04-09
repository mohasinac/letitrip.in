"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/appkit/http";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MonthEntry {
  month: string;
  orders: number;
  revenue: number;
}

interface TopProduct {
  productId: string;
  title: string;
  revenue: number;
  orders: number;
  mainImage: string;
}

interface AnalyticsSummary {
  totalOrders: number;
  totalRevenue: number;
  newOrdersThisMonth: number;
  revenueThisMonth: number;
  totalProducts: number;
  publishedProducts: number;
}

interface AnalyticsData {
  summary: AnalyticsSummary;
  ordersByMonth: MonthEntry[];
  topProducts: TopProduct[];
}

export interface AnalyticsResponse {
  data: AnalyticsData;
}

/**
 * useAdminAnalytics
 * Fetches admin analytics via GET /api/admin/analytics with a 5-min client-side cache.
 */
export function useAdminAnalytics() {
  return useQuery<AnalyticsResponse>({
    queryKey: ["admin-analytics"],
    queryFn: async () => ({
      data: await apiClient.get<AnalyticsData>("/api/admin/analytics"),
    }),
    staleTime: 5 * 60 * 1000,
  });
}
