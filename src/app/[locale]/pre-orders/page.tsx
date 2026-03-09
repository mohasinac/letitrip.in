/**
 * Pre-Orders Listing Page
 *
 * Route: /pre-orders
 * Thin orchestration layer — all logic in PreOrdersView.
 */

import { getTranslations } from "next-intl/server";
import { PreOrdersView } from "@/features/products";
import { SITE_CONFIG } from "@/constants";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("preOrders");
  const title = `${t("title")} — ${SITE_CONFIG.brand.name}`;
  return {
    title,
    description: t("subtitle"),
    openGraph: { title, type: "website" },
  };
}

export default function PreOrdersPage() {
  return <PreOrdersView />;
}
