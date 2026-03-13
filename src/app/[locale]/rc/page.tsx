import type { Metadata } from "next";
import { SITE_CONFIG } from "@/constants";
import { RCInfoView } from "@/features/about";
import { getTranslations } from "next-intl/server";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("rcInfo");
  return {
    title: ` — `,
    description: t("metaDescription"),
  };
}

export default async function RCInfoPage() {
  return <RCInfoView />;
}
