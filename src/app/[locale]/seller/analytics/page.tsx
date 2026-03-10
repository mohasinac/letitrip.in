/**
 * Seller Analytics Page
 *
 * Route: /seller/analytics
 * Displays the authenticated seller's revenue + orders analytics.
 */

"use client";

import { Spinner, Heading, Text } from "@/components";
import {
  SellerAnalyticsStats,
  SellerRevenueChart,
  SellerTopProducts,
  useSellerAnalytics,
} from "@/features/seller";
import { THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";

const { themed, spacing, typography, flex } = THEME_CONSTANTS;

export default function SellerAnalyticsPage() {
  const t = useTranslations("sellerAnalytics");
  const { summary, revenueByMonth, topProducts, isLoading } =
    useSellerAnalytics();

  if (isLoading) {
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
