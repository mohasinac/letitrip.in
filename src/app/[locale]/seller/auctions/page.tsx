import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SITE_CONFIG } from "@/constants";
import { SellerAuctionsView } from "@/features/seller";
import { AdminPageHeader } from "@/components";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("sellerAuctions");
  return {
    title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

export default async function SellerAuctionsPage() {
  const t = await getTranslations("sellerAuctions");
  return (
    <>
      <AdminPageHeader title={t("pageTitle")} subtitle={t("pageSubtitle")} />
      <SellerAuctionsView />
    </>
  );
}
