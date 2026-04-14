"use client";
// Thin adapter — layout lives in @mohasinac/appkit
import { useTranslations } from "next-intl";
import { ROUTES } from "@/constants";
import { useHomepageReviews } from "@/hooks";
import type { ReviewDocument } from "@/db/schema";
import { CustomerReviewsSection as AppkitCustomerReviewsSection } from "@mohasinac/appkit/features/homepage";
import { ReviewCard, type Review } from "@mohasinac/appkit/features/reviews";

interface CustomerReviewsSectionProps {
  initialReviews?: ReviewDocument[];
}

export function CustomerReviewsSection({
  initialReviews,
}: CustomerReviewsSectionProps = {}) {
  const t = useTranslations("homepage");
  const { data, isLoading } = useHomepageReviews({
    initialData: initialReviews as unknown as Review[],
  });

  return (
    <AppkitCustomerReviewsSection
      title={t("whatOurCustomersSay")}
      subtitle={t("reviewsSubtitle")}
      items={data ?? []}
      renderItem={(review) => <ReviewCard review={review as Review} />}
      keyExtractor={(review) => (review as Review).id}
      viewMoreHref={ROUTES.PUBLIC.REVIEWS}
      viewMoreLabel={t("viewAllReviews")}
      isLoading={isLoading}
    />
  );
}
