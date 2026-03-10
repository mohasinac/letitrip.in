/**
 * Public Reviews Page
 *
 * Route: /reviews
 * Showcases featured customer reviews from across the platform.
 */

import { getTranslations } from "next-intl/server";
import { ReviewsListView } from "@/features/reviews";
import { SITE_CONFIG } from "@/constants";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("reviews");
  const title = `${t("title")} — ${SITE_CONFIG.brand.name}`;
  return {
    title,
    description: t("subtitle"),
    openGraph: { title, type: "website" },
  };
}

export default function ReviewsPage() {
  return <ReviewsListView />;
}
