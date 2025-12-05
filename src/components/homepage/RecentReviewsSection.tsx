/**
 * @fileoverview React Component
 * @module src/components/homepage/RecentReviewsSection
 * @description This file contains the RecentReviewsSection component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { logError } from "@/lib/error-logger";
import { HorizontalScrollContainer } from "@/components/common/HorizontalScrollContainer";
import { ReviewCard } from "@/components/cards/ReviewCard";
import { homepageService } from "@/services/homepage.service";
import { analyticsService } from "@/services/analytics.service";
import type { ReviewFE } from "@/types/frontend/review.types";
import { ExternalLink } from "lucide-react";

/**
 * RecentReviewsSectionProps interface
 * 
 * @interface
 * @description Defines the structure and contract for RecentReviewsSectionProps
 */
interface RecentReviewsSectionProps {
  /** Limit */
  limit?: number;
  /** Class Name */
  className?: string;
}

/**
 * Function: Recent Reviews Section
 */
/**
 * Performs recent reviews section operation
 *
 * @param {RecentReviewsSectionProps} [{
  limit] - The {
  limit
 *
 * @returns {any} The recentreviewssection result
 *
 * @example
 * RecentReviewsSection({
  limit);
 */

/**
 * Performs recent reviews section operation
 *
 * @param {RecentReviewsSectionProps} [{
  limit] - The {
  limit
 *
 * @returns {any} The recentreviewssection result
 *
 * @example
 * RecentReviewsSection({
  limit);
 */

/**
 * Performs recent reviews section operation
 *
 * @param {RecentReviewsSectionProps} [{
  limit = 10,
  className = "",
}] - The {
  limit = 10,
  classname = "",
}
 *
 * @returns {any} The recentreviewssection result
 *
 * @example
 * RecentReviewsSection({
  limit = 10,
  className = "",
});
 */
export function RecentReviewsSection({
  limit = 10,
  className = "",
}: RecentReviewsSectionProps) {
  const [reviews, setReviews] = useState<ReviewFE[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, [limit]);

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await homepageService.getRecentReviews(limit);
      setReviews(data);

      if (data.length > 0) {
        analyticsService.trackEvent("homepage_recent_reviews_viewed", {
          /** Count */
          count: data.length,
        });
      }
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "RecentReviewsSection.loadReviews",
      });
    } finally {
      setLoading(false);
    }
  };

  // Don't render if no reviews
  if (!loading && reviews.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <section className={`py-8 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Recent Reviews
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: Math.min(limit, 6) }).map((_, i) => (
            <div
              key={i}
              className="h-48 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={`py-8 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Recent Reviews
      </h2>

      <HorizontalScrollContainer itemWidth="350px" gap="1rem" showArrows={true}>
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            id={review.id}
            userId={review.userId}
            userName={review.userName}
            rating={review.rating}
            title={review.title ?? undefined}
            comment={review.comment}
            media={review.images}
            verifiedPurchase={review.isVerifiedPurchase}
            helpfulCount={review.helpful}
            createdAt={review.createdAt}
            showProduct={false}
          />
        ))}
      </HorizontalScrollContainer>

      {/* View All Reviews Button - Centered */}
      <div className="flex justify-center mt-8">
        <Link
          href="/reviews"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          View All Reviews
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}
