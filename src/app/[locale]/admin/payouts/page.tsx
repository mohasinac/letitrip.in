import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SITE_CONFIG } from "@/constants";
import { AdminPayoutsView } from "@/features/admin";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("adminPayouts");
  return {
    title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

export default function AdminPayoutsPage() {
  return <AdminPayoutsView />;
}
