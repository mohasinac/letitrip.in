import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SITE_CONFIG } from "@/constants";
import { SellerShippingView } from "@/features/seller";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("sellerShipping");
  return {
    title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

export default async function SellerShippingPage() {
  return <SellerShippingView />;
}
