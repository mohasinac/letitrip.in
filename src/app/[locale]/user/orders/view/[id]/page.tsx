import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SITE_CONFIG } from "@/constants";
import { OrderDetailView } from "@/features/user";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("orders");
  return {
    title: `${t("metaTitleDetail")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescriptionDetail"),
    robots: { index: false, follow: false },
  };
}

export default function OrderViewPage() {
  return <OrderDetailView />;
}
