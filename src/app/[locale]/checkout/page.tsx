/**
 * Checkout Page
 *
 * Route: /checkout
 * Thin wrapper — all logic lives in CheckoutView.
 */

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SITE_CONFIG } from "@/constants";
import { CheckoutView } from "@/features/cart";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("checkout");
  return {
    title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

export default function CheckoutPage() {
  return <CheckoutView />;
}
