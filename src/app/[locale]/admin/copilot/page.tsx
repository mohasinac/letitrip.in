import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SITE_CONFIG } from "@/constants";
import { AdminCopilotView } from "@/features/copilot";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("copilot");
  return {
    title: `${t("title")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

export default function AdminCopilotPage() {
  return <AdminCopilotView />;
}
