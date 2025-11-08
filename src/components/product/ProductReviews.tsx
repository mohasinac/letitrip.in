"use client";

import { useState, useEffect } from "react";
import { Star, ThumbsUp } from "lucide-react";
import { reviewsService } from "@/services/reviews.service";
import { EmptyState } from "@/components/common/EmptyState";
import type { Review } from "@/types";

interface ProductReviewsProps {
  productId: string;
  productSlug: string;
}

export function ProductReviews({
  productId,
  productSlug,
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingBreakdown: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    },
  });

  useEffect(() => {
    loadReviews();
  }, [productSlug]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewsService.list({ productId });
      const reviewsList = data.data || [];
      setReviews(reviewsList);

      // Calculate stats
      if (reviewsList.length > 0) {
        const totalRating = reviewsList.reduce(
          (sum: number, r: Review) => sum + r.rating,
          0
        );
        const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviewsList.forEach((r: Review) => {
          breakdown[r.rating as keyof typeof breakdown]++;
        });

        setStats({
          averageRating: totalRating / reviewsList.length,
          totalReviews: reviewsList.length,
          ratingBreakdown: breakdown,
        });
      }
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="h-20 bg-gray-200 rounded" />
          <div className="h-20 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Customer Reviews
        </h2>
        <EmptyState
          title="No reviews yet"
          description="Be the first to review this product!"
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Customer Reviews
      </h2>

      {/* Rating Summary */}
      <div className="grid md:grid-cols-2 gap-6 mb-8 pb-8 border-b">
        {/* Average Rating */}
        <div className="text-center">
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {stats.averageRating.toFixed(1)}
          </div>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 ${
                  star <= Math.round(stats.averageRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <div className="text-gray-600">
            Based on {stats.totalReviews} reviews
          </div>
        </div>

        {/* Rating Breakdown */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count =
              stats.ratingBreakdown[
                rating as keyof typeof stats.ratingBreakdown
              ];
            const percentage =
              stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

            return (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm text-gray-600 w-8">{rating} ★</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="border-b last:border-b-0 pb-6 last:pb-0"
          >
            {/* Review Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">Customer</span>
                  {review.verifiedPurchase && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                      Verified Purchase
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(review.createdAt.toString())}
                  </span>
                </div>
              </div>
            </div>

            {/* Review Content */}
            {review.title && (
              <h4 className="font-semibold text-gray-900 mb-2">
                {review.title}
              </h4>
            )}
            <p className="text-gray-700 mb-3">{review.comment}</p>

            {/* Helpful Button */}
            <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors">
              <ThumbsUp className="w-4 h-4" />
              Helpful {review.helpfulCount > 0 && `(${review.helpfulCount})`}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
