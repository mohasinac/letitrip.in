/**
 * User RC Page
 *
 * Route: /user/rc
 * Thin shell — auth-gated by UserLayout, logic lives in RCWallet.
 */
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SITE_CONFIG } from "@/constants";
import { RCWallet } from "@/features/user";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("rcWallet");
  return {
    title: `${t("metaTitle")} — ${SITE_CONFIG.brand.name}`,
    description: t("metaDescription"),
    robots: { index: false, follow: false },
  };
}

export default function UserRCPage() {
  return <RCWallet />;
}
