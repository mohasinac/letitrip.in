/**
 * Public Reviews Page
 *
 * Route: /reviews
 * Showcases featured customer reviews from across the platform.
 */

import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { ReviewsListView } from "@/features/reviews";
import { SITE_CONFIG } from "@/constants";
import type { Metadata } from "next";
import { reviewRepository } from "@/repositories";
import type { ReviewsApiResult } from "@/features/reviews/hooks/useReviews";
import { resolveLocale } from "@/i18n/resolve-locale";
import { serverLogger } from "@/lib/server-logger";

export const revalidate = 60;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("reviews");
  const title = `${t("title")} — ${SITE_CONFIG.brand.name}`;
  return {
    title,
    description: t("subtitle"),
    openGraph: { title, type: "website" },
  };
}

export default async function ReviewsPage({ params }: Props) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  setRequestLocale(locale);

  const initialData: ReviewsApiResult | undefined = await reviewRepository
    .listAll({
      filters: "status==approved",
      sorts: "-rating",
      page: 1,
      pageSize: 200,
    })
    .then((reviewDocs) => reviewDocs.items)
    .catch((error: unknown) => {
      serverLogger.warn("reviews/page: initial data fetch failed", {
        locale,
        error,
      });
      return undefined;
    });

  return <ReviewsListView initialData={initialData} />;
}
