import type { Metadata } from "next";
import { SITE_CONFIG } from "@/constants";
import { SellerGuideView } from "@/features/seller";
import { getTranslations } from "next-intl/server";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("sellerGuide");
  return {
    title: ` — `,
    description: t("metaDescription"),
  };
}

export default async function SellerGuidePage() {
  return <SellerGuideView />;
}
