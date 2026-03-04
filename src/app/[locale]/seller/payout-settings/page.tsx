import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SITE_CONFIG } from "@/constants";
import { SellerPayoutSettingsView } from "@/features/seller";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("sellerPayoutSettings");
  return {
    title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

export default async function SellerPayoutSettingsPage() {
  return <SellerPayoutSettingsView />;
}
