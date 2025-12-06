/**
 * @fileoverview React Component
 * @module src/components/layout/FeaturedReviewsSection
 * @description This file contains the FeaturedReviewsSection component and its related functionality
 *
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { ReviewCard } from "@/components/cards/ReviewCard";
import { FeaturedSection } from "@/components/common/FeaturedSection";
import { reviewsService } from "@/services/reviews.service";
import type { ReviewFE } from "@/types/frontend/review.types";
import { Star } from "lucide-react";

export default function FeaturedReviewsSection() {
  return (
    <FeaturedSection<ReviewFE>
      title="⭐ Customer Reviews"
      icon={Star}
      viewAllLink="/reviews"
      viewAllText="View All Reviews"
      fetchData={async () => {
        const reviewsList = await reviewsService.getHomepage();
        return reviewsList.slice(0, 10);
      }}
      renderItem={(review) => (
        <ReviewCard
          key={review.id}
          id={review.id}
          userId={review.userId}
          userName="Customer"
          productId={review.productId || undefined}
          productName="Product"
          rating={review.rating}
          title={review.title || undefined}
          comment={review.comment}
          media={review.media}
          verifiedPurchase={review.verifiedPurchase || false}
          helpfulCount={review.helpfulCount || 0}
          createdAt={review.createdAt}
          compact={true}
          showProduct={true}
        />
      )}
      itemWidth="350px"
    />
  );
}
