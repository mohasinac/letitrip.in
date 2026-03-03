/**
 * Seller Analytics Page
 *
 * Route: /seller/analytics
 * Displays the authenticated seller's revenue + orders analytics.
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  Spinner,
  SellerAnalyticsStats,
  SellerRevenueChart,
  SellerTopProducts,
  Heading,
  Text,
} from "@/components";
import type {
  SellerAnalyticsSummary,
  MonthEntry,
  TopProduct,
} from "@/components";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { useTranslations } from "next-intl";
import { useAuth, useApiQuery } from "@/hooks";
import { sellerService } from "@/services";
import { hasAnyRole } from "@/helpers";

const { themed, spacing, typography, flex } = THEME_CONSTANTS;

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
    queryFn: () => sellerService.getAnalytics(),
    enabled: !!user && hasAnyRole(user.role, ["seller", "admin"]),
    cacheTTL: 5 * 60 * 1000,
  });

  const summary = data?.summary;
  const revenueByMonth = data?.revenueByMonth ?? [];
  const topProducts = data?.topProducts ?? [];

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className={`${flex.center} min-h-[50vh]`}>
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className={spacing.stack}>
      <div>
        <Heading level={1} className={typography.h3}>
          {t("pageTitle")}
        </Heading>
        <Text size="sm" variant="secondary" className="mt-1">
          {t("pageSubtitle")}
        </Text>
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
          <Text size="sm" weight="medium">
            {t("noData")}
          </Text>
          <Text size="xs" variant="secondary">
            {t("noDataDesc")}
          </Text>
        </div>
      )}
    </div>
  );
}
