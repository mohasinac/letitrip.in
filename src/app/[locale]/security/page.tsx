import type { Metadata } from "next";
import { SITE_CONFIG } from "@/constants";
import { SecurityPrivacyView } from "@/features/about";
import { getTranslations } from "next-intl/server";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("securityPage");
  return {
    title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescription"),
  };
}

export default async function SecurityPage() {
  return <SecurityPrivacyView />;
}
