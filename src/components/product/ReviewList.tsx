"use client";

import { useState, useEffect } from "react";
import { Star, ThumbsUp, Check } from "lucide-react";
import { logError } from "@/lib/firebase-error-logger";
import { OptimizedImage } from "@letitrip/react-library";
import { reviewsService } from "@/services/reviews.service";
import { EmptyState } from "@letitrip/react-library";
import {
  ReviewList as LibraryReviewList,
  Review,
  ReviewStats,
} from "@letitrip/react-library";
import { format } from "date-fns";

interface ReviewListProps {
  productId: string;
}

export default function ReviewList({ productId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<"recent" | "helpful" | "rating">(
    "recent"
  );
  const [filterRating, setFilterRating] = useState<number | null>(null);

  useEffect(() => {
    loadReviews();
  }, [productId, sortBy, filterRating]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const response = await reviewsService.list({
        productId,
        rating: filterRating || undefined,
        sortBy:
          sortBy === "helpful"
            ? "helpfulCount"
            : sortBy === "rating"
              ? "rating"
              : "createdAt",
        sortOrder: "desc",
        limit: 20,
      });

      setReviews(response.data as any);

      // Load stats (only if productId is provided)
      if (productId) {
        const statsData = await reviewsService.getSummary({ productId });
        setStats({
          totalReviews: statsData.totalReviews,
          averageRating: statsData.averageRating,
          ratingDistribution: statsData.ratingDistribution.reduce(
            (acc: any, item: any) => {
              acc[item.rating] = item.count;
              return acc;
            },
            {}
          ),
        });
      }
    } catch (error) {
      logError(error as Error, {
        component: "ReviewList.loadReviews",
        metadata: { productId },
      });
      setReviews([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      const result = await reviewsService.markHelpful(reviewId);

      // Update local state
      setReviews(
        reviews.map((r) =>
          r.id === reviewId ? { ...r, helpful_count: result.helpfulCount } : r
        )
      );
    } catch (error: any) {
      logError(error as Error, {
        component: "ReviewList.handleMarkHelpful",
        metadata: { reviewId },
      });
    }
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), "MMM d, yyyy");
    } catch {
      return date;
    }
  };

  return (
    <LibraryReviewList
      productId={productId}
      reviews={reviews}
      stats={stats}
      loading={loading}
      sortBy={sortBy}
      filterRating={filterRating}
      onSortChange={setSortBy}
      onFilterRatingChange={setFilterRating}
      onMarkHelpful={handleMarkHelpful}
      formatDate={formatDate}
      ImageComponent={OptimizedImage}
      icons={{
        star: Star,
        thumbsUp: ThumbsUp,
        check: Check,
        emptyState: <Star className="w-12 h-12" />,
      }}
      EmptyStateComponent={EmptyState}
    />
  );
}
