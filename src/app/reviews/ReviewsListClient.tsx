"use client";

import { useState, useEffect } from "react";
import { ReviewCard } from "@/components/cards/ReviewCard";
import { reviewsService } from "@/services/reviews.service";
import type { ReviewFE, ReviewFiltersFE } from "@/types/frontend/review.types";
import { Search, Filter, Star, ShieldCheck } from "lucide-react";

export default function ReviewsListClient() {
  const [reviews, setReviews] = useState<ReviewFE[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReviewFiltersFE>({
    status: "approved",
    page: 1,
    limit: 20,
    sortBy: "recent",
  });
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchReviews();
  }, [filters]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await reviewsService.list(filters);

      // Handle both array and paginated response
      if (Array.isArray(response)) {
        setReviews(response);
        setTotalPages(1);
      } else {
        setReviews(response.data || []);
        // Calculate total pages from count
        setTotalPages(Math.ceil((response.count || 0) / 20));
      }
    } catch (err) {
      setError("Failed to load reviews. Please try again later.");
      console.error("Error fetching reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await reviewsService.markHelpful(reviewId);
      // Update the review in state
      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId
            ? { ...review, helpful: (review.helpful || 0) + 1 }
            : review,
        ),
      );
    } catch (err) {
      console.error("Error marking review as helpful:", err);
    }
  };

  const handleRatingFilter = (rating: number) => {
    setFilters((prev) => ({
      ...prev,
      rating: prev.rating === rating ? undefined : rating,
      page: 1,
    }));
  };

  const handleVerifiedFilter = () => {
    setFilters((prev) => ({
      ...prev,
      isVerifiedPurchase: !prev.isVerifiedPurchase,
      page: 1,
    }));
  };

  const handleSortChange = (sortBy: ReviewFiltersFE["sortBy"]) => {
    setFilters((prev) => ({
      ...prev,
      sortBy,
      page: 1,
    }));
  };

  // Calculate rating distribution (would be better from API)
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage:
      reviews.length > 0
        ? (reviews.filter((r) => r.rating === rating).length / reviews.length) *
          100
        : 0,
  }));

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Customer Reviews
        </h1>
        <p className="text-lg text-gray-600">
          Authentic reviews from verified purchases across our platform
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Filters */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Filters
            </h2>

            {/* Overall Rating */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Overall Rating
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= Math.round(averageRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xl font-bold text-gray-900">
                  {averageRating.toFixed(1)}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                Based on {reviews.length} reviews
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Filter by Rating
              </h3>
              <div className="space-y-2">
                {ratingDistribution.map(({ rating, count, percentage }) => (
                  <button
                    key={rating}
                    onClick={() => handleRatingFilter(rating)}
                    className={`w-full flex items-center gap-2 p-2 rounded hover:bg-gray-50 ${
                      filters.rating === rating ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">{rating}</span>
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </div>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">{count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Verified Purchase */}
            <div className="mb-6">
              <button
                onClick={handleVerifiedFilter}
                className={`w-full flex items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                  filters.isVerifiedPurchase
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <ShieldCheck
                  className={`w-5 h-5 ${
                    filters.isVerifiedPurchase
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                />
                <span className="text-sm font-medium">
                  Verified Purchases Only
                </span>
              </button>
            </div>

            {/* Sort */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Sort By
              </h3>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  handleSortChange(e.target.value as ReviewFiltersFE["sortBy"])
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="recent">Most Recent</option>
                <option value="helpful">Most Helpful</option>
                <option value="rating">Highest Rating</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Active Filters */}
          {(filters.rating || filters.isVerifiedPurchase) && (
            <div className="flex items-center gap-2 mb-6 p-4 bg-white rounded-lg">
              <span className="text-sm text-gray-600">Active filters:</span>
              {filters.rating && (
                <button
                  onClick={() => handleRatingFilter(filters.rating!)}
                  className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200"
                >
                  <Star className="w-3 h-3 fill-current" />
                  <span>{filters.rating} stars</span>
                  <span className="ml-1">×</span>
                </button>
              )}
              {filters.isVerifiedPurchase && (
                <button
                  onClick={handleVerifiedFilter}
                  className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200"
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified</span>
                  <span className="ml-1">×</span>
                </button>
              )}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
              <button
                onClick={fetchReviews}
                className="mt-2 text-red-600 hover:text-red-700 font-medium"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse bg-white rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reviews List */}
          {!loading && reviews.length > 0 && (
            <>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    id={review.id}
                    userId={review.userId}
                    userName="User" // Would come from user data
                    productId={review.productId || undefined}
                    productName="Product" // Would come from product data
                    rating={review.rating}
                    title={review.title || undefined}
                    comment={review.comment}
                    media={review.images}
                    verifiedPurchase={review.isVerifiedPurchase}
                    helpfulCount={review.helpful}
                    createdAt={review.createdAt}
                    onMarkHelpful={handleMarkHelpful}
                    showProduct={true}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        page: Math.max(1, (prev.page || 1) - 1),
                      }))
                    }
                    disabled={filters.page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <span className="px-4 py-2 text-gray-700">
                    Page {filters.page} of {totalPages}
                  </span>

                  <button
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        page: Math.min(totalPages, (prev.page || 1) + 1),
                      }))
                    }
                    disabled={filters.page === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!loading && reviews.length === 0 && (
            <div className="bg-white rounded-lg p-12 text-center">
              <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No reviews found
              </h3>
              <p className="text-gray-600 mb-4">
                {filters.rating || filters.isVerifiedPurchase
                  ? "Try adjusting your filters"
                  : "Be the first to leave a review!"}
              </p>
              {(filters.rating || filters.isVerifiedPurchase) && (
                <button
                  onClick={() =>
                    setFilters({
                      status: "approved",
                      page: 1,
                      limit: 20,
                      sortBy: "recent",
                    })
                  }
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
