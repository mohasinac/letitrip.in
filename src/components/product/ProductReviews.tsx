"use client";

import { useState, useEffect } from "react";
import { Star, ThumbsUp, Edit } from "lucide-react";
import { reviewsService } from "@/services/reviews.service";
import { EmptyState } from "@/components/common/EmptyState";
import ReviewForm from "./ReviewForm";
import ReviewList from "./ReviewList";
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
  const [showReviewForm, setShowReviewForm] = useState(false);
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
          0,
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

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Header with Write Review Button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
        {!showReviewForm && (
          <button
            onClick={() => setShowReviewForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Write a Review
          </button>
        )}
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="mb-8 p-6 border border-gray-200 rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Write Your Review
          </h3>
          <ReviewForm
            productId={productId}
            onSuccess={() => {
              setShowReviewForm(false);
              loadReviews();
            }}
            onCancel={() => setShowReviewForm(false)}
          />
        </div>
      )}

      {/* Reviews List */}
      <ReviewList productId={productId} />
    </div>
  );
}
