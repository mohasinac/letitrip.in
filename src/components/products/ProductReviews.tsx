"use client";

import { useState } from "react";
import Image from "next/image";
import { UI_LABELS, API_ENDPOINTS, THEME_CONSTANTS } from "@/constants";
import { formatRelativeTime } from "@/utils";
import { useApiQuery } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import type { ReviewDocument } from "@/db/schema";

const { themed, borderRadius } = THEME_CONSTANTS;

interface ReviewsResponse {
  data: ReviewDocument[];
  meta: {
    total: number;
    totalPages: number;
    hasMore: boolean;
    averageRating: number;
    ratingDistribution: Record<number, number>;
  };
}

interface ProductReviewsProps {
  productId: string;
}

function StarRating({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = { sm: "text-xs", md: "text-sm", lg: "text-base" };
  return (
    <div className={`flex items-center gap-0.5 ${sizes[size]}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={
            star <= rating
              ? "text-amber-400"
              : "text-gray-300 dark:text-gray-600"
          }
        >
          ★
        </span>
      ))}
    </div>
  );
}

function RatingBar({
  star,
  count,
  total,
}: {
  star: number;
  count: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className={`w-3 ${themed.textSecondary}`}>{star}</span>
      <span className="text-amber-400 text-xs">★</span>
      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className="bg-amber-400 h-full rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`w-6 text-right ${themed.textSecondary}`}>{count}</span>
    </div>
  );
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useApiQuery<ReviewsResponse>({
    queryKey: ["reviews", productId, String(page)],
    queryFn: () =>
      apiClient.get(
        `${API_ENDPOINTS.REVIEWS.LIST}?productId=${productId}&page=${page}&pageSize=${pageSize}`,
      ),
  });

  const reviews = data?.data ?? [];
  const meta = data?.meta;
  const totalReviews = meta?.total ?? 0;
  const avgRating = meta?.averageRating ?? 0;
  const dist = meta?.ratingDistribution ?? {};

  return (
    <section>
      <h2 className={`text-xl font-bold mb-4 ${themed.textPrimary}`}>
        {UI_LABELS.PRODUCT_DETAIL.REVIEWS_TITLE}
      </h2>

      {/* Rating summary */}
      {totalReviews > 0 && (
        <div
          className={`flex flex-col sm:flex-row gap-6 p-5 ${themed.bgSecondary} ${borderRadius.xl} mb-6`}
        >
          {/* Average */}
          <div className="flex flex-col items-center justify-center sm:w-32 shrink-0">
            <span className={`text-5xl font-bold ${themed.textPrimary}`}>
              {avgRating.toFixed(1)}
            </span>
            <StarRating rating={Math.round(avgRating)} size="md" />
            <span className={`text-xs mt-1 ${themed.textSecondary}`}>
              {totalReviews} reviews
            </span>
          </div>

          {/* Distribution bars */}
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((star) => (
              <RatingBar
                key={star}
                star={star}
                count={dist[star] ?? 0}
                total={totalReviews}
              />
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`animate-pulse ${themed.bgSecondary} rounded-xl p-4 space-y-2`}
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* No reviews */}
      {!isLoading && reviews.length === 0 && (
        <div className="text-center py-12">
          <p className={`font-medium ${themed.textPrimary}`}>
            {UI_LABELS.PRODUCT_DETAIL.REVIEWS_NONE}
          </p>
          <p className={`text-sm mt-1 ${themed.textSecondary}`}>
            {UI_LABELS.PRODUCT_DETAIL.REVIEWS_BE_FIRST}
          </p>
        </div>
      )}

      {/* Review list */}
      {!isLoading && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className={`p-4 ${themed.bgSecondary} ${borderRadius.xl} space-y-2`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {review.userAvatar ? (
                    <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0">
                      <Image
                        src={review.userAvatar}
                        alt={review.userName}
                        fill
                        className="object-cover"
                        sizes="36px"
                      />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                        {review.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className={`font-medium text-sm ${themed.textPrimary}`}>
                      {review.userName}
                    </p>
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} />
                      {review.verified && (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          {UI_LABELS.PRODUCT_DETAIL.VERIFIED_PURCHASE}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <span className={`text-xs ${themed.textSecondary} shrink-0`}>
                  {formatRelativeTime(review.createdAt)}
                </span>
              </div>

              {/* Content */}
              {review.title && (
                <p className={`font-semibold text-sm ${themed.textPrimary}`}>
                  {review.title}
                </p>
              )}
              <p className={`text-sm leading-relaxed ${themed.textSecondary}`}>
                {review.comment}
              </p>

              {/* Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1 pt-1">
                  {review.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative shrink-0 w-16 h-16 rounded-lg overflow-hidden"
                    >
                      <Image
                        src={img}
                        alt={`Review photo ${idx + 1}`}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Helpful */}
              {review.helpfulCount > 0 && (
                <p className={`text-xs ${themed.textSecondary}`}>
                  {UI_LABELS.PRODUCT_DETAIL.HELPFUL(review.helpfulCount)}
                </p>
              )}
            </div>
          ))}

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${themed.bgPrimary} ${themed.textPrimary} border ${themed.border}`}
              >
                {UI_LABELS.ACTIONS.BACK}
              </button>
              <span className={`text-sm ${themed.textSecondary}`}>
                {page} / {meta.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!meta.hasMore}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${themed.bgPrimary} ${themed.textPrimary} border ${themed.border}`}
              >
                {UI_LABELS.ACTIONS.NEXT}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
