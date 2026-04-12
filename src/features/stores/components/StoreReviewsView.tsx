"use client";

import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { StoreReviewsView as AppkitStoreReviewsView } from "@mohasinac/appkit/features/stores";
import {
  Caption,
  Heading,
  Stack,
  Text,
  Spinner,
  Row,
} from "@mohasinac/appkit/ui";
import { EmptyState } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { formatDate } from "@/utils";
import { useStoreReviews } from "../hooks";

const { spacing, themed, flex, overflow, page } = THEME_CONSTANTS;

interface StoreReviewsViewProps {
  storeSlug: string;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <Row gap="xs">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < rating ? "text-yellow-400 fill-yellow-400" : "text-zinc-300 dark:text-zinc-600"}`}
        />
      ))}
    </Row>
  );
}

export function StoreReviewsView({ storeSlug }: StoreReviewsViewProps) {
  const t = useTranslations("storePage");
  const {
    reviews,
    averageRating,
    totalReviews,
    ratingDistribution,
    isLoading,
    error,
  } = useStoreReviews(storeSlug);

  return (
    <AppkitStoreReviewsView
      storeSlug={storeSlug}
      items={reviews as any}
      total={totalReviews}
      isLoading={isLoading}
      renderSummary={() => {
        if (isLoading || !!error || !reviews.length || totalReviews === 0)
          return null;
        return (
          <div
            className={`${themed.bgSecondary} rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row gap-6 mb-4`}
          >
            <div className={`${flex.centerCol} gap-1 sm:w-32 ${flex.noShrink}`}>
              <Heading level={2}>{averageRating.toFixed(1)}</Heading>
              <StarRow rating={Math.round(averageRating)} />
              <Caption>{t("reviews.outOf5")}</Caption>
              <Caption>
                {t("reviews.totalCount", { count: totalReviews })}
              </Caption>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = ratingDistribution[star] ?? 0;
                const pct =
                  totalReviews > 0
                    ? Math.round((count / totalReviews) * 100)
                    : 0;
                return (
                  <Row key={star} gap="sm">
                    <Caption className="w-3">{star}</Caption>
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                    <div
                      className={`flex-1 h-2 rounded-full bg-zinc-200 dark:bg-slate-700 ${overflow.hidden}`}
                    >
                      <div
                        className="h-full bg-yellow-400 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <Caption className="w-8 text-right">{count}</Caption>
                  </Row>
                );
              })}
            </div>
          </div>
        );
      }}
      renderReviews={(_items, loading) => {
        if (loading) {
          return (
            <div className={`${flex.hCenter} ${page.empty}`}>
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
        if (!reviews.length || totalReviews === 0) {
          return (
            <EmptyState
              title={t("reviews.empty.title")}
              description={t("reviews.empty.description")}
            />
          );
        }
        return (
          <Stack gap="md">
            {reviews.map((review) => (
              <div
                key={review.id}
                className={`${themed.bgPrimary} border ${themed.border} rounded-xl p-4 sm:p-5`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <Row wrap gap="sm" className="mb-1">
                      <Text weight="semibold" size="sm">
                        {review.userName ?? t("reviews.anonymous")}
                      </Text>
                      <StarRow rating={review.rating} />
                      <Caption>{formatDate(review.createdAt)}</Caption>
                    </Row>
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
          </Stack>
        );
      }}
    />
  );
}
