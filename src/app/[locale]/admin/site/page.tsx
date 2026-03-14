import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SITE_CONFIG } from "@/constants";
import { AdminSiteView } from "@/features/admin";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("adminSite");
  return {
    title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

export default function AdminSiteSettings() {
  return <AdminSiteView />;
}
