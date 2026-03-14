import type { Metadata } from "next";
import { SITE_CONFIG } from "@/constants";
import { HowPayoutsWorkView } from "@/features/seller";
import { getTranslations } from "next-intl/server";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("howPayoutsWork");
  return {
    title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescription"),
  };
}

export default async function HowPayoutsWorkPage() {
  return <HowPayoutsWorkView />;
}
