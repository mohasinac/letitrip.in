"use client";

import { Heading, Text, Spinner } from "@mohasinac/appkit/ui";
import { SellerAnalyticsView as AppkitSellerAnalyticsView } from "@mohasinac/appkit/features/seller";
import {
  SellerAnalyticsStats,
  SellerRevenueChart,
  SellerTopProducts,
} from "@mohasinac/appkit/features/seller";

import { useSellerAnalytics } from "../hooks/useSellerAnalytics";
import { THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import { formatCurrency } from "@/utils";

const { flex, spacing } = THEME_CONSTANTS;

export function SellerAnalyticsView() {
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
    <AppkitSellerAnalyticsView
      labels={{ title: t("pageTitle") }}
      isLoading={isLoading}
      renderDateRange={() => (
        <Text size="sm" variant="secondary" className="mb-4">
          {t("pageSubtitle")}
        </Text>
      )}
      renderStats={() =>
        summary ? (
          <SellerAnalyticsStats
            summary={summary}
            labels={{
              totalRevenue: t("totalRevenue"),
              totalOrders: t("totalOrders"),
              totalProducts: t("totalProducts"),
              publishedProducts: t("publishedProducts"),
            }}
            formatRevenue={formatCurrency}
          />
        ) : null
      }
      renderCharts={() =>
        summary ? (
          <SellerRevenueChart
            data={revenueByMonth}
            labels={{
              title: t("revenueChartTitle"),
              noData: t("noData"),
              revenueLabel: t("revenueLabel"),
            }}
            formatRevenue={formatCurrency}
          />
        ) : null
      }
      renderTopProducts={() =>
        summary ? (
          topProducts.length > 0 ? (
            <SellerTopProducts
              products={topProducts}
              labels={{
                title: t("topProductsTitle"),
                ordersLabel: t("ordersLabel"),
              }}
              formatRevenue={formatCurrency}
            />
          ) : (
            <div className={`text-center py-12 ${spacing.stack}`}>
              <Text size="sm" weight="medium">
                {t("noData")}
              </Text>
              <Text size="xs" variant="secondary">
                {t("noDataDesc")}
              </Text>
            </div>
          )
        ) : (
          <div className={`text-center py-12 ${spacing.stack}`}>
            <Text size="sm" weight="medium">
              {t("noData")}
            </Text>
            <Text size="xs" variant="secondary">
              {t("noDataDesc")}
            </Text>
          </div>
        )
      }
    />
  );
}

