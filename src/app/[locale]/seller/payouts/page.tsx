/**
 * Seller Payouts Page
 *
 * Route: /seller/payouts
 * Thin shell — all logic lives in SellerPayoutsView.
 */
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SITE_CONFIG } from "@/constants";
import { SellerPayoutsView } from "@/features/seller";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("sellerPayouts");
  return {
    title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

export default function SellerPayoutsPage() {
  return <SellerPayoutsView />;
}
