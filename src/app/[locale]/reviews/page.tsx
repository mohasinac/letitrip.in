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
import { reviewRepository } from "@/repositories";
import type { ReviewsApiResult } from "@/features/reviews/hooks/useReviews";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("reviews");
  const title = `${t("title")} — ${SITE_CONFIG.brand.name}`;
  return {
    title,
    description: t("subtitle"),
    openGraph: { title, type: "website" },
  };
}

export default async function ReviewsPage() {
  const reviewDocs = await reviewRepository.listAll({
    filters: "status==approved",
    sorts: "-rating",
    page: 1,
    pageSize: 200,
  });
  const initialData: ReviewsApiResult = reviewDocs.items;

  return <ReviewsListView initialData={initialData} />;
}
