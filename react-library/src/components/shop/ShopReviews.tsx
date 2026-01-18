import {
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Star,
  ThumbsUp,
} from "lucide-react";
import { useState } from "react";

export interface ShopReview {
  id: string;
  authorName: string;
  authorAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpfulCount: number;
  isHelpful?: boolean;
}

interface Shop {
  id: string;
  rating?: number;
  reviewCount?: number;
}

export interface ShopReviewsProps {
  shop: Shop;
  reviews?: ShopReview[];
  loading?: boolean;
  onSubmitReview?: (rating: number, comment: string) => Promise<void>;
  onMarkHelpful?: (reviewId: string) => Promise<boolean>;
  className?: string;
  // Injected components
  EmptyStateComponent?: React.ComponentType<{
    title: string;
    description: string;
  }>;
  // Notification callbacks
  onSubmitSuccess?: (message: string) => void;
  onSubmitError?: (message: string) => void;
  onMarkHelpfulError?: (message: string) => void;
}

function RatingStars({
  rating,
  onSelect,
}: {
  rating: number;
  onSelect?: (rating: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onSelect?.(star)}
          className={`${
            star <= rating
              ? "text-yellow-400 fill-yellow-400"
              : "text-gray-300 dark:text-gray-600"
          } ${onSelect ? "cursor-pointer hover:scale-110" : ""} transition-all`}
          disabled={!onSelect}
          aria-label={`Rate ${star} star${star === 1 ? "" : "s"}`}
        >
          <Star className="w-5 h-5" />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({
  review,
  onMarkHelpful,
}: {
  review: ShopReview;
  onMarkHelpful?: (id: string) => void;
}) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
          {review.authorAvatar ? (
            <img
              src={review.authorAvatar}
              alt={review.authorName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-gray-600 dark:text-gray-400 font-medium">
              {review.authorName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Review Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">
                {review.authorName}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(review.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <RatingStars rating={review.rating} />
          </div>

          <p className="text-gray-700 dark:text-gray-300 mb-3">
            {review.comment}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => onMarkHelpful?.(review.id)}
              className={`flex items-center gap-1 text-sm ${
                review.isHelpful
                  ? "text-primary"
                  : "text-gray-500 dark:text-gray-400 hover:text-primary"
              } transition-colors`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Helpful ({review.helpfulCount})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ShopReviews Component
 *
 * Pure React component for displaying shop reviews with filtering, sorting, and submission form.
 * Framework-independent implementation with callback injection pattern.
 *
 * Features:
 * - Review list with ratings and comments
 * - Filter by rating (all, 5★, 4★, etc.)
 * - Sort by recent/helpful
 * - Review submission form
 * - Average rating breakdown
 * - Mark reviews as helpful
 *
 * @example
 * ```tsx
 * <ShopReviews
 *   shop={shop}
 *   reviews={reviews}
 *   onSubmitReview={handleSubmit}
 *   onMarkHelpful={handleMarkHelpful}
 *   EmptyStateComponent={EmptyState}
 *   onSubmitSuccess={(msg) => toast.success(msg)}
 *   onSubmitError={(msg) => toast.error(msg)}
 * />
 * ```
 */
export function ShopReviews({
  shop,
  reviews = [],
  loading = false,
  onSubmitReview,
  onMarkHelpful,
  className = "",
  EmptyStateComponent,
  onSubmitSuccess,
  onSubmitError,
  onMarkHelpfulError,
}: ShopReviewsProps) {
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"recent" | "helpful">("recent");
  const [showForm, setShowForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Default EmptyState component (fallback)
  const EmptyState =
    EmptyStateComponent ||
    (({ title, description }: { title: string; description: string }) => (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    ));

  // Calculate rating breakdown
  const ratingBreakdown = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: reviews.length
      ? (reviews.filter((r) => r.rating === rating).length / reviews.length) *
        100
      : 0,
  }));

  // Filter and sort reviews
  const filteredReviews = reviews
    .filter((r) => (filterRating ? r.rating === filterRating : true))
    .sort((a, b) => {
      if (sortBy === "recent") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else {
        return b.helpfulCount - a.helpfulCount;
      }
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmitReview || newRating === 0 || !newComment.trim()) return;

    try {
      setSubmitting(true);
      await onSubmitReview(newRating, newComment);
      setNewRating(0);
      setNewComment("");
      setShowForm(false);
      onSubmitSuccess?.("Review submitted successfully!");
    } catch (error: any) {
      onSubmitError?.(error.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await onMarkHelpful?.(reviewId);
    } catch (error: any) {
      onMarkHelpfulError?.(error.message || "Failed to mark review as helpful");
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Rating Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Average Rating */}
          <div className="text-center md:text-left">
            <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
              {shop.rating?.toFixed(1) || "0.0"}
            </div>
            <RatingStars rating={Math.round(shop.rating || 0)} />
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Based on {shop.reviewCount || 0} reviews
            </p>
          </div>

          {/* Rating Breakdown */}
          <div className="space-y-2">
            {ratingBreakdown.map(({ rating, count, percentage }) => (
              <button
                key={rating}
                type="button"
                onClick={() =>
                  setFilterRating(filterRating === rating ? null : rating)
                }
                className={`w-full flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors ${
                  filterRating === rating ? "bg-gray-100 dark:bg-gray-700" : ""
                }`}
                aria-label={`Filter by ${rating}-star reviews (${count} reviews)`}
              >
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-8">
                  {rating}★
                </span>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setSortBy("recent")}
            className={`text-sm font-medium ${
              sortBy === "recent"
                ? "text-primary"
                : "text-gray-600 dark:text-gray-400 hover:text-primary"
            } transition-colors`}
          >
            Most Recent
          </button>
          <button
            type="button"
            onClick={() => setSortBy("helpful")}
            className={`text-sm font-medium ${
              sortBy === "helpful"
                ? "text-primary"
                : "text-gray-600 dark:text-gray-400 hover:text-primary"
            } transition-colors`}
          >
            Most Helpful
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          Write a Review
          {showForm ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Write Your Review
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Rating
              </label>
              <RatingStars rating={newRating} onSelect={setNewRating} />
            </div>

            <div>
              <label
                htmlFor="review-comment"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Your Review
              </label>
              <textarea
                id="review-comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                placeholder="Share your experience with this shop..."
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting || newRating === 0 || !newComment.trim()}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        {filteredReviews.length === 0 ? (
          <EmptyState
            title="No reviews yet"
            description={
              filterRating
                ? `No ${filterRating}-star reviews found`
                : "Be the first to review this shop"
            }
          />
        ) : (
          <div className="space-y-6">
            {filteredReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onMarkHelpful={handleMarkHelpful}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ShopReviews;
