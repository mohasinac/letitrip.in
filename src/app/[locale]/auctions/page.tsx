/**
 * Auctions Listing Page
 *
 * Route: /auctions
 * Thin orchestration layer — all logic in AuctionsView.
 */

import { getTranslations } from "next-intl/server";
import { AuctionsView } from "@/features/products";
import { SITE_CONFIG } from "@/constants";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auctions");
  const title = `${t("title")} — ${SITE_CONFIG.brand.name}`;
  return {
    title,
    openGraph: { title, type: "website" },
  };
}

export default function AuctionsPage() {
  return <AuctionsView />;
}
