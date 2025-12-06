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

import { ReviewCard } from "@/components/cards/ReviewCard";
import { FeaturedSection } from "@/components/common/FeaturedSection";
import { analyticsService } from "@/services/analytics.service";
import { homepageService } from "@/services/homepage.service";
import type { ReviewFE } from "@/types/frontend/review.types";
import { MessageSquare } from "lucide-react";

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
  return (
    <FeaturedSection<ReviewFE>
      title="Recent Reviews"
      icon={MessageSquare}
      viewAllLink="/reviews"
      viewAllText="View All Reviews"
      fetchData={async () => {
        const data = await homepageService.getRecentReviews(limit);
        if (data.length > 0) {
          analyticsService.trackEvent("homepage_recent_reviews_viewed", {
            count: data.length,
          });
        }
        return data;
      }}
      renderItem={(review) => (
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
      )}
      itemWidth="350px"
      showArrows={true}
      className={className}
    />
  );
}
