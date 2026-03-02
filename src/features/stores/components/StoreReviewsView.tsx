"use client";

import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { EmptyState, Spinner, Heading, Text, Caption } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { formatDate } from "@/utils";
import { useStoreReviews } from "../hooks";

const { spacing, themed } = THEME_CONSTANTS;

interface StoreReviewsViewProps {
  storeSlug: string;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
        />
      ))}
    </div>
  );
}

export function StoreReviewsView({ storeSlug }: StoreReviewsViewProps) {
  const t = useTranslations("storePage");
  const { data, isLoading, error } = useStoreReviews(storeSlug);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    );
  }

  if (!!error) {
    return (
      <EmptyState
        title={t("error.title")}
        description={t("error.description")}
      />
    );
  }

  if (!data || data.totalReviews === 0) {
    return (
      <EmptyState
        title={t("reviews.empty.title")}
        description={t("reviews.empty.description")}
      />
    );
  }

  const { reviews, averageRating, totalReviews, ratingDistribution } = data;

  return (
    <div className={spacing.stack}>
      {/* Summary card */}
      <div
        className={`${themed.bgSecondary} rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row gap-6`}
      >
        <div className="flex flex-col items-center justify-center gap-1 sm:w-32 flex-shrink-0">
          <Heading level={2}>{averageRating.toFixed(1)}</Heading>
          <StarRow rating={Math.round(averageRating)} />
          <Caption>{t("reviews.outOf5")}</Caption>
          <Caption>{t("reviews.totalCount", { count: totalReviews })}</Caption>
        </div>

        <div className="flex-1 flex flex-col gap-1">
          {[5, 4, 3, 2, 1].map((star) => {
            const count = ratingDistribution[star] ?? 0;
            const pct =
              totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
            return (
              <div key={star} className="flex items-center gap-2">
                <Caption className="w-3">{star}</Caption>
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <Caption className="w-8 text-right">{count}</Caption>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review list */}
      <div className="flex flex-col gap-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className={`${themed.bgPrimary} border ${themed.border} rounded-xl p-4 sm:p-5`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Text weight="semibold" size="sm">
                    {review.userName ?? t("reviews.anonymous")}
                  </Text>
                  <StarRow rating={review.rating} />
                  <Caption>{formatDate(review.createdAt)}</Caption>
                </div>
                {review.productTitle && (
                  <Caption className="mb-1 italic">
                    {review.productTitle}
                  </Caption>
                )}
                {review.comment && (
                  <Text variant="secondary" size="sm">
                    {review.comment}
                  </Text>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
