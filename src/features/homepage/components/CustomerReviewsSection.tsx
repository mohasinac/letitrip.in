"use client";
// Thin adapter — layout lives in @mohasinac/appkit
import { useTranslations } from "next-intl";
import { ROUTES } from "@/constants";
import { useHomepageReviews } from "@/hooks";
import { ReviewCard } from "@/components";
import type { ReviewCardData } from "@/components";
import type { ReviewDocument } from "@/db/schema";
import { CustomerReviewsSection as AppkitCustomerReviewsSection } from "@mohasinac/appkit/features/homepage";

interface CustomerReviewsSectionProps {
  initialReviews?: ReviewDocument[];
}

export function CustomerReviewsSection({
  initialReviews,
}: CustomerReviewsSectionProps = {}) {
  const t = useTranslations("homepage");
  const { data, isLoading } = useHomepageReviews({
    initialData: initialReviews as unknown as ReviewCardData[],
  });

  return (
    <AppkitCustomerReviewsSection
      title={t("whatOurCustomersSay")}
      subtitle={t("reviewsSubtitle")}
      items={data ?? []}
      renderItem={(review) => <ReviewCard review={review as ReviewCardData} />}
      keyExtractor={(review) => (review as ReviewCardData).id}
      viewMoreHref={ROUTES.PUBLIC.REVIEWS}
      viewMoreLabel={t("viewAllReviews")}
      isLoading={isLoading}
    />
  );
}
