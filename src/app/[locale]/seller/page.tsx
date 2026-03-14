/**
 * Seller Dashboard Page
 * Route: /[locale]/seller
 * Thin shell — delegates to SellerDashboardView.
 */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SITE_CONFIG } from "@/constants";
import { SellerDashboardView } from "@/features/seller";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("sellerDashboard");
  return {
    title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

export default function SellerDashboardPage() {
  return <SellerDashboardView />;
}
