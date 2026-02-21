"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { useApiQuery, useSwipe } from "@/hooks";
import { API_ENDPOINTS, THEME_CONSTANTS, UI_LABELS, ROUTES } from "@/constants";
import { apiClient } from "@/lib/api-client";
import type { ReviewDocument } from "@/db/schema";

export function CustomerReviewsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data, isLoading } = useApiQuery<ReviewDocument[]>({
    queryKey: ["reviews", "featured"],
    queryFn: () =>
      apiClient.get(
        `${API_ENDPOINTS.REVIEWS.LIST}?featured=true&status=approved&limit=6`,
      ),
  });

  const reviews = data || [];
  const totalGroups = Math.ceil(reviews.length / 3);

  const sectionRef = useRef<HTMLElement>(null);

  const goNext = () =>
    setCurrentIndex((p) => (p + 3 >= reviews.length ? 0 : p + 3));
  const goPrev = () =>
    setCurrentIndex((p) => (p === 0 ? Math.max(0, reviews.length - 3) : p - 3));

  useSwipe(sectionRef, { onSwipeLeft: goNext, onSwipeRight: goPrev });

  if (isLoading) {
    return (
      <section
        className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.themed.bgPrimary}`}
      >
        <div className="w-full">
          <div
            className={`h-8 ${THEME_CONSTANTS.skeleton.base} mb-8 max-w-xs mx-auto`}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`${THEME_CONSTANTS.skeleton.card} h-48`}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  const visibleReviews = reviews.slice(currentIndex, currentIndex + 3);

  return (
    <section
      ref={sectionRef}
      className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.themed.bgPrimary}`}
    >
      <div className="w-full">
        {/* Section Header */}
        <div className="text-center mb-10">
          <h2
            className={`${THEME_CONSTANTS.typography.h2} ${THEME_CONSTANTS.themed.textPrimary} mb-3`}
          >
            {UI_LABELS.HOMEPAGE.REVIEWS.TITLE}
          </h2>
          <p
            className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary}`}
          >
            {UI_LABELS.HOMEPAGE.REVIEWS.SUBTITLE}
          </p>
        </div>

        {/* Reviews Grid â€” 3-col on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {visibleReviews.map((review) => (
            <div
              key={review.id}
              className={`${THEME_CONSTANTS.themed.bgSecondary} ${THEME_CONSTANTS.borderRadius.xl} ${THEME_CONSTANTS.spacing.padding.lg}`}
            >
              {/* Star Rating using lucide-react */}
              <div
                className="flex gap-1 mb-4"
                aria-label={`${review.rating} out of 5 stars`}
              >
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < review.rating
                        ? "text-yellow-500 fill-yellow-500"
                        : "text-gray-300 dark:text-gray-600"
                    }`}
                  />
                ))}
              </div>

              {/* Review Text */}
              <p
                className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textPrimary} mb-4 line-clamp-4`}
              >
                &ldquo;{review.comment}&rdquo;
              </p>

              {/* User Info */}
              <div className="flex items-center gap-3">
                {review.userAvatar ? (
                  <Image
                    src={review.userAvatar}
                    alt={review.userName}
                    width={40}
                    height={40}
                    sizes="40px"
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {review.userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textPrimary} font-medium truncate`}
                  >
                    {review.userName}
                  </p>
                  <p
                    className={`${THEME_CONSTANTS.typography.small} ${THEME_CONSTANTS.themed.textSecondary} truncate`}
                  >
                    {review.productTitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Dots */}
        {totalGroups > 1 && (
          <div className="flex justify-center gap-2 mb-6">
            {[...Array(totalGroups)].map((_, i) => (
              <button
                key={i}
                className={`h-2 rounded-full transition-all ${
                  Math.floor(currentIndex / 3) === i
                    ? "bg-blue-600 w-8"
                    : "bg-gray-300 dark:bg-gray-600 w-2"
                }`}
                onClick={() => setCurrentIndex(i * 3)}
                aria-label={`Go to review group ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* See all reviews link */}
        <div className="text-center">
          <Link
            href={ROUTES.PUBLIC.PRODUCTS}
            className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            {UI_LABELS.HOMEPAGE.REVIEWS.SEE_ALL}
          </Link>
        </div>
      </div>
    </section>
  );
}
