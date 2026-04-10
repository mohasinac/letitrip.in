"use client";

import { Heading, Text } from "@mohasinac/appkit/ui";
import { Spinner } from "@/components";
import { SellerAnalyticsStats } from "./SellerAnalyticsStats";
import { SellerRevenueChart } from "./SellerRevenueChart";
import { SellerTopProducts } from "./SellerTopProducts";
import { useSellerAnalytics } from "../hooks/useSellerAnalytics";
import { THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";

const { themed, spacing, typography, flex } = THEME_CONSTANTS;

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
    <div className={spacing.stack}>
      <div>
        <Heading level={1} className={typography.h3}>
          {t("pageTitle")}
        </Heading>
        <Text size="sm" variant="secondary" className="mt-1">
          {t("pageSubtitle")}
        </Text>
      </div>

      {summary && (
        <>
          <SellerAnalyticsStats summary={summary} />
          <SellerRevenueChart data={revenueByMonth} />
          <SellerTopProducts products={topProducts} />
        </>
      )}

      {!summary && (
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
