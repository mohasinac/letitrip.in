/**
 * Seller Analytics Page
 *
 * Route: /seller/analytics
 * Thin shell — all logic lives in SellerAnalyticsView.
 */
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SITE_CONFIG } from "@/constants";
import { SellerAnalyticsView } from "@/features/seller";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("sellerAnalytics");
  return {
    title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

export default function SellerAnalyticsPage() {
  return <SellerAnalyticsView />;
}
