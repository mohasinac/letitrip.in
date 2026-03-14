import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SITE_CONFIG } from "@/constants";
import { SellerOffersView } from "@/features/seller";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("offers");
  return {
    title: `${t("sellerMetaTitle")} — ${SITE_CONFIG.brand.name}`,
    description: t("sellerMetaDescription"),
    robots: { index: false, follow: false },
  };
}

export default function SellerOffersPage() {
  return <SellerOffersView />;
}
