import type { Metadata } from "next";
import { SITE_CONFIG } from "@/constants";
import { HowPreOrdersWorkView } from "@/features/homepage";
import { getTranslations } from "next-intl/server";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("howPreOrdersWork");
  return {
    title: ` — `,
    description: t("metaDescription"),
  };
}

export default async function HowPreOrdersWorkPage() {
  return <HowPreOrdersWorkView />;
}
