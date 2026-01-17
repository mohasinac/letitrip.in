import { ComponentType, ReactNode } from "react";

export interface Review {
  id: string;
  user_id: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface ReviewListProps {
  productId: string;
  reviews: Review[];
  stats: ReviewStats | null;
  loading: boolean;
  sortBy: "recent" | "helpful" | "rating";
  filterRating: number | null;
  onSortChange: (sortBy: "recent" | "helpful" | "rating") => void;
  onFilterRatingChange: (rating: number | null) => void;
  onMarkHelpful: (reviewId: string) => void;
  formatDate?: (date: string) => string;
  ImageComponent: ComponentType<{
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
    objectFit?: string;
  }>;
  icons?: {
    star?: ComponentType<{ className?: string }>;
    thumbsUp?: ComponentType<{ className?: string }>;
    check?: ComponentType<{ className?: string }>;
    emptyState?: ReactNode;
  };
  EmptyStateComponent?: ComponentType<{
    icon: ReactNode;
    title: string;
    description: string;
  }>;
}

export function ReviewList({
  productId,
  reviews,
  stats,
  loading,
  sortBy,
  filterRating,
  onSortChange,
  onFilterRatingChange,
  onMarkHelpful,
  formatDate,
  ImageComponent,
  icons = {},
  EmptyStateComponent,
}: ReviewListProps) {
  const StarIcon =
    icons.star ||
    (() => (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ));
  const ThumbsUpIcon =
    icons.thumbsUp ||
    (() => (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
      </svg>
    ));
  const CheckIcon =
    icons.check ||
    (() => (
      <svg
        className="w-3 h-3"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ));

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    if (!stats) return null;

    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count =
            stats.ratingDistribution[
              rating as keyof typeof stats.ratingDistribution
            ];
          const percentage =
            stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

          return (
            <button
              key={rating}
              onClick={() =>
                onFilterRatingChange(filterRating === rating ? null : rating)
              }
              className={`w-full flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors ${
                filterRating === rating ? "bg-blue-50 dark:bg-blue-900/30" : ""
              }`}
            >
              <span className="text-sm font-medium w-12 text-gray-900 dark:text-white">
                {rating} star
              </span>
              <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-400 transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                {count}
              </span>
            </button>
          );
        })}
      </div>
    );
  };

  const defaultFormatDate = (date: string) => {
    return new Date(date).toLocaleDateString();
  };

  const dateFormatter = formatDate || defaultFormatDate;

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      {stats && stats.totalReviews > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b dark:border-gray-700">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
              {stats.averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center mb-2">
              {renderStars(Math.round(stats.averageRating))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Based on {stats.totalReviews} review
              {stats.totalReviews !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Rating Distribution */}
          <div className="md:col-span-2">{renderRatingDistribution()}</div>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        {/* Sort */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="review-sort"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Sort by:
          </label>
          <select
            id="review-sort"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="rating">Highest Rating</option>
          </select>
        </div>

        {/* Filter Clear */}
        {filterRating && (
          <button
            onClick={() => onFilterRatingChange(null)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Reviews List */}
      {!reviews || reviews.length === 0 ? (
        EmptyStateComponent ? (
          <EmptyStateComponent
            icon={icons.emptyState || <StarIcon className="w-12 h-12" />}
            title="No reviews yet"
            description={
              filterRating
                ? `No ${filterRating}-star reviews found`
                : "Be the first to review this product"
            }
          />
        ) : (
          <div className="text-center py-12 text-gray-500">
            {filterRating
              ? `No ${filterRating}-star reviews found`
              : "No reviews yet"}
          </div>
        )
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border-b dark:border-gray-700 pb-6 last:border-b-0"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    {renderStars(review.rating)}
                    {review.verified_purchase && (
                      <span className="flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                        <CheckIcon className="w-3 h-3" />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  {review.title && (
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {review.title}
                    </h4>
                  )}
                </div>
                <time className="text-sm text-gray-500 dark:text-gray-400">
                  {dateFormatter(review.created_at)}
                </time>
              </div>

              {/* Comment */}
              <p className="text-gray-700 dark:text-gray-300 mb-3 whitespace-pre-wrap">
                {review.comment}
              </p>

              {/* Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {review.images.map((url, index) => (
                    <ImageComponent
                      key={index}
                      src={url}
                      alt={`Review image ${index + 1}`}
                      width={80}
                      height={80}
                      className="rounded-lg border border-gray-200 dark:border-gray-600 cursor-pointer hover:opacity-75 transition-opacity"
                      objectFit="cover"
                    />
                  ))}
                </div>
              )}

              {/* Helpful */}
              <button
                onClick={() => onMarkHelpful(review.id)}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <ThumbsUpIcon className="w-4 h-4" />
                <span>
                  Helpful{" "}
                  {review.helpful_count > 0 && `(${review.helpful_count})`}
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
