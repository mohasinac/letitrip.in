"use client";

import { useApiQuery } from "@/hooks";
import { adminService } from "@/services";

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

export interface AnalyticsResponse {
  data: {
    summary: AnalyticsSummary;
    ordersByMonth: MonthEntry[];
    topProducts: TopProduct[];
  };
}

/**
 * useAdminAnalytics
 * Wraps `adminService.getAnalytics()` with a 5-min client-side cache.
 */
export function useAdminAnalytics() {
  return useApiQuery<AnalyticsResponse>({
    queryKey: ["admin-analytics"],
    queryFn: () => adminService.getAnalytics(),
    cacheTTL: 5 * 60 * 1000,
  });
}
