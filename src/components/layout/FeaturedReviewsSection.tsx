"use client";

import { useState, useEffect } from "react";
import { ReviewCard } from "@/components/cards/ReviewCard";
import { HorizontalScrollContainer } from "@/components/common/HorizontalScrollContainer";
import { reviewsService } from "@/services/reviews.service";
import type { ReviewFE } from "@/types/frontend/review.types";

export default function FeaturedReviewsSection() {
  const [reviews, setReviews] = useState<ReviewFE[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedReviews();
  }, []);

  const fetchFeaturedReviews = async () => {
    try {
      setLoading(true);
      const reviewsList = await reviewsService.getHomepage();
      setReviews(reviewsList.slice(0, 10));
    } catch (error) {
      console.error("Error fetching featured reviews:", error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6"></div>
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="min-w-[350px] h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"
              ></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-8">
      <HorizontalScrollContainer
        title="⭐ Customer Reviews"
        viewAllLink="/reviews"
        viewAllText="View All Reviews"
        itemWidth="350px"
        gap="1rem"
      >
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            id={review.id}
            userId={review.userId}
            userName="Customer" // Would come from user data
            productId={review.productId || undefined}
            productName="Product" // Would come from product data
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
        ))}
      </HorizontalScrollContainer>
    </section>
  );
}
