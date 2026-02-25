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
import { THEME_CONSTANTS, API_ENDPOINTS, ROUTES } from "@/constants";
import { useTranslations } from "next-intl";
import { useAuth, useApiQuery } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { hasAnyRole } from "@/helpers";

const { themed, spacing, typography } = THEME_CONSTANTS;

interface AnalyticsResponse {
  summary: SellerAnalyticsSummary;
  revenueByMonth: MonthEntry[];
  topProducts: TopProduct[];
}

export default function SellerAnalyticsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const t = useTranslations("sellerAnalytics");

  useEffect(() => {
    if (
      !authLoading &&
      (!user || !hasAnyRole(user.role, ["seller", "admin"]))
    ) {
      router.push(ROUTES.SELLER.DASHBOARD);
    }
  }, [user, authLoading, router]);

  const { data, isLoading } = useApiQuery<AnalyticsResponse>({
    queryKey: ["seller-analytics", user?.uid ?? ""],
    queryFn: () =>
      apiClient.get<AnalyticsResponse>(API_ENDPOINTS.SELLER.ANALYTICS),
    enabled: !!user && hasAnyRole(user.role, ["seller", "admin"]),
    cacheTTL: 5 * 60 * 1000,
  });

  const summary = data?.summary;
  const revenueByMonth = data?.revenueByMonth ?? [];
  const topProducts = data?.topProducts ?? [];

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
          {t("pageTitle")}
        </h1>
        <p className={`mt-1 text-sm ${themed.textSecondary}`}>
          {t("pageSubtitle")}
        </p>
      </div>

      {isLoading && (
        <div className={`text-center py-12 ${themed.textSecondary}`}>
          {t("loading")}
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
            {t("noData")}
          </p>
          <p className={`text-xs ${themed.textSecondary}`}>{t("noDataDesc")}</p>
        </div>
      )}
    </div>
  );
}
