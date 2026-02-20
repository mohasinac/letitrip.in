/**
 * Seller Analytics Page
 *
 * Route: /seller/analytics
 * Displays the authenticated seller's revenue + orders analytics.
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Spinner,
  SellerAnalyticsStats,
  SellerRevenueChart,
  SellerTopProducts,
} from "@/components";
import type {
  SellerAnalyticsSummary,
  MonthEntry,
  TopProduct,
} from "@/components";
import { UI_LABELS, THEME_CONSTANTS, API_ENDPOINTS, ROUTES } from "@/constants";
import { useAuth, useApiQuery } from "@/hooks";

const { themed, spacing, typography } = THEME_CONSTANTS;

interface AnalyticsResponse {
  data: {
    summary: SellerAnalyticsSummary;
    revenueByMonth: MonthEntry[];
    topProducts: TopProduct[];
  };
}

export default function SellerAnalyticsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const LABELS = UI_LABELS.SELLER_ANALYTICS;

  useEffect(() => {
    if (
      !authLoading &&
      (!user || (user.role !== "seller" && user.role !== "admin"))
    ) {
      router.push(ROUTES.SELLER.DASHBOARD);
    }
  }, [user, authLoading, router]);

  const { data, isLoading } = useApiQuery<AnalyticsResponse>({
    queryKey: ["seller-analytics", user?.uid ?? ""],
    queryFn: () => fetch(API_ENDPOINTS.SELLER.ANALYTICS).then((r) => r.json()),
    enabled: !!user && (user.role === "seller" || user.role === "admin"),
    cacheTTL: 5 * 60 * 1000,
  });

  const summary = data?.data?.summary;
  const revenueByMonth = data?.data?.revenueByMonth ?? [];
  const topProducts = data?.data?.topProducts ?? [];

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className={spacing.stack}>
      <div>
        <h1 className={`${typography.h3} ${themed.textPrimary}`}>
          {LABELS.PAGE_TITLE}
        </h1>
        <p className={`mt-1 text-sm ${themed.textSecondary}`}>
          {LABELS.PAGE_SUBTITLE}
        </p>
      </div>

      {isLoading && (
        <div className={`text-center py-12 ${themed.textSecondary}`}>
          {LABELS.LOADING}
        </div>
      )}

      {!isLoading && summary && (
        <>
          <SellerAnalyticsStats summary={summary} />
          <SellerRevenueChart data={revenueByMonth} />
          <SellerTopProducts products={topProducts} />
        </>
      )}

      {!isLoading && !summary && (
        <div className={`text-center py-12 ${spacing.stack}`}>
          <p className={`text-sm font-medium ${themed.textPrimary}`}>
            {LABELS.NO_DATA}
          </p>
          <p className={`text-xs ${themed.textSecondary}`}>
            {LABELS.NO_DATA_DESC}
          </p>
        </div>
      )}
    </div>
  );
}
