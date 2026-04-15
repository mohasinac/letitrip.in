/**
 * AdminAnalyticsView � Thin Adapter
 *
 * Tier 2 � feature component.
 * Passes letitrip analytics data + labels into appkit AdminAnalyticsView shell.
 * No chart rendering logic here � appkit owns the charts.
 */

"use client";

import { ROUTES } from "@/constants";
import { useTranslations } from "next-intl";
import { AdminAnalyticsView as AppkitAdminAnalyticsView } from "@mohasinac/appkit/features/admin";
import type { AnalyticsTopProduct } from "@mohasinac/appkit/features/admin";
import { AdminPageHeader, TextLink } from "@/components";
import { useAdminAnalytics } from "@/features/admin/hooks";
import { formatCurrency } from "@/utils";

export function AdminAnalyticsView() {
  const t = useTranslations("adminAnalytics");
  const { data, isLoading } = useAdminAnalytics();

  return (
    <AppkitAdminAnalyticsView
      data={data?.data}
      labels={{
        title: t("pageTitle"),
        subtitle: t("pageSubtitle"),
        totalRevenue: t("totalRevenue"),
        totalOrders: t("totalOrders"),
        revenueThisMonth: t("revenueThisMonth"),
        ordersThisMonth: t("ordersThisMonth"),
        revenueByMonth: t("revenueByMonth"),
        ordersByMonth: t("ordersByMonth"),
        topProducts: t("topProducts"),
        orders: t("orders"),
        view: t("view"),
      }}
      formatRevenue={formatCurrency}
      renderProductLink={(product: AnalyticsTopProduct) => (
        <TextLink
          href={`${ROUTES.ADMIN.PRODUCTS}/${product.productId}`}
          className="text-xs"
        >
          {t("view")}
        </TextLink>
      )}
      renderHeader={() => (
        <AdminPageHeader title={t("pageTitle")} subtitle={t("pageSubtitle")} />
      )}
      isLoading={isLoading}
    />
  );
}

