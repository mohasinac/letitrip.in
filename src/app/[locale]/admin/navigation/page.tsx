import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SITE_CONFIG } from "@/constants";
import { AdminNavigationView } from "@/features/admin";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("adminNavigation");
  return {
    title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

export default function AdminNavigationPage() {
  return <AdminNavigationView />;
}
