import type { Metadata } from "next";
import { SITE_CONFIG } from "@/constants";
import { HowAuctionsWorkView } from "@/features/homepage";
import { getTranslations } from "next-intl/server";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("howAuctionsWork");
  return {
    title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescription"),
  };
}

export default async function HowAuctionsWorkPage() {
  return <HowAuctionsWorkView />;
}
