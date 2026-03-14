/**
 * User Orders Page
 *
 * Route: /user/orders
 * Thin orchestration layer — all logic in UserOrdersView.
 */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SITE_CONFIG } from "@/constants";
import { UserOrdersView } from "@/features/user";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("orders");
  return {
    title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

export default function UserOrdersPage() {
  return <UserOrdersView />;
}
