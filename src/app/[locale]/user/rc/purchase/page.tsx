/**
 * User RC Purchase Page
 *
 * Route: /user/rc/purchase
 * Thin shell — auth-gated by UserLayout, logic lives in RCPurchaseView.
 */
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SITE_CONFIG } from "@/constants";
import { RCPurchaseView } from "@/features/user";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("rcWallet");
  return {
    title: `${t("metaTitlePurchase")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescriptionPurchase"),
    robots: { index: false, follow: false },
  };
}

export default function UserRCPurchasePage() {
  return <RCPurchaseView />;
}
