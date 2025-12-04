"use client";

import { logError } from "@/lib/firebase-error-logger";

/**
 * Seller Reviews Page
 *
 * @status IMPLEMENTED
 * @epic E007 - Review System
 *
 * Displays reviews for seller's products with:
 * - Filter by product, rating, status
 * - Respond to reviews
 * - View review analytics
 */

import OptimizedImage from "@/components/common/OptimizedImage";
import { PageState } from "@/components/common/PageState";
import { SimplePagination } from "@/components/common/Pagination";
import { FormInput, FormSelect } from "@/components/forms";
import { useAuth } from "@/contexts/AuthContext";
import { useLoadingState } from "@/hooks/useLoadingState";
import { apiService } from "@/services/api.service";
import { productsService } from "@/services/products.service";
import { reviewsService } from "@/services/reviews.service";
import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle,
  Clock,
  MessageSquare,
  Package,
  Search,
  Send,
  Star,
  ThumbsUp,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

interface Review {
  id: string;
  productId: string;
  productSlug: string;
  productName: string;
  productImage?: string;
  userId: string;
  userName: string;
  rating: number;
  title?: string;
  content: string;
  images?: string[];
  verifiedPurchase: boolean;
  helpfulCount: number;
  sellerResponse?: {
    content: string;
    respondedAt: string;
  };
  createdAt: string;
  status: "pending" | "published" | "flagged";
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
  pendingResponses: number;
  respondedPercentage: number;
}

export default function SellerReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats>({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    pendingResponses: 0,
    respondedPercentage: 0,
  });

  // Loading state
  const { isLoading, error, execute } = useLoadingState<void>();

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [ratingFilter, setRatingFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Response modal
  const [respondingTo, setRespondingTo] = useState<Review | null>(null);
  const [responseText, setResponseText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Products list for filter
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>(
    []
  );

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    loadReviews();
  }, [currentPage, selectedProduct, ratingFilter, statusFilter]);

  const loadProducts = async () => {
    try {
      // Get products for this seller's shop(s)
      const response = await productsService.list({});
      setProducts(
        (response.data || []).map((p: { id: string; name: string }) => ({
          id: p.id,
          name: p.name,
        }))
      );
    } catch (error) {
      logError(error as Error, {
        component: "SellerReviews.loadProducts",
      });
    }
  };

  const loadReviews = useCallback(async () => {
    if (!user) return;

    await execute(async () => {
      // Build filters
      const filters: Record<string, string | number | boolean> = {
        sellerId: user.id,
        page: currentPage,
        limit: pageSize,
      };

      if (selectedProduct) {
        filters.productId = selectedProduct;
      }

      if (ratingFilter) {
        filters.rating = parseInt(ratingFilter);
      }

      if (statusFilter !== "all") {
        if (statusFilter === "needs-response") {
          filters.needsResponse = true;
        } else {
          filters.status = statusFilter;
        }
      }

      const response = await reviewsService.list(filters);

      // Transform response to our Review type
      const reviewData: Review[] = (response.data || []).map((r) => ({
        id: r.id,
        productId: r.productId || "",
        productSlug: r.productSlug || r.productId || "", // Use productSlug if available, fallback to productId
        productName: "Product", // Will be fetched separately if needed
        productImage: undefined,
        userId: r.userId,
        userName: r.userName || "Anonymous",
        rating: r.rating,
        title: r.title || undefined,
        content: r.comment || "",
        images: r.images,
        verifiedPurchase: r.isVerifiedPurchase || r.verifiedPurchase || false,
        helpfulCount: r.helpful || r.helpfulCount || 0,
        sellerResponse: r.replyText
          ? {
              content: r.replyText,
              respondedAt: r.replyAt?.toString() || new Date().toISOString(),
            }
          : undefined,
        createdAt: r.createdAt?.toString() || new Date().toISOString(),
        status:
          r.status === "approved"
            ? "published"
            : r.status === "rejected"
            ? "flagged"
            : "pending",
      }));

      setReviews(reviewData);
      setTotalPages(Math.ceil((response.count || 0) / pageSize));

      // Calculate stats
      const totalReviews = response.count || reviewData.length;
      const avgRating =
        reviewData.length > 0
          ? reviewData.reduce((sum: number, r: Review) => sum + r.rating, 0) /
            reviewData.length
          : 0;
      const needsResponse = reviewData.filter(
        (r: Review) => !r.sellerResponse
      ).length;
      const responded = reviewData.filter(
        (r: Review) => r.sellerResponse
      ).length;

      const distribution: Record<number, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      };
      reviewData.forEach((r: Review) => {
        if (r.rating >= 1 && r.rating <= 5) {
          distribution[r.rating]++;
        }
      });

      setStats({
        totalReviews,
        averageRating: Math.round(avgRating * 10) / 10,
        ratingDistribution: distribution,
        pendingResponses: needsResponse,
        respondedPercentage:
          reviewData.length > 0
            ? Math.round((responded / reviewData.length) * 100)
            : 0,
      });
    });
  }, [user, currentPage, selectedProduct, ratingFilter, statusFilter, execute]);

  const handleRespond = async () => {
    if (!respondingTo || !responseText.trim()) return;

    try {
      setSubmitting(true);

      // Use moderate endpoint to add seller reply
      await apiService.patch(`/api/reviews/${respondingTo.id}/moderate`, {
        replyText: responseText.trim(),
      });

      // Update local state
      setReviews((prev) =>
        prev.map((r) =>
          r.id === respondingTo.id
            ? {
                ...r,
                sellerResponse: {
                  content: responseText.trim(),
                  respondedAt: new Date().toISOString(),
                },
              }
            : r
        )
      );

      setRespondingTo(null);
      setResponseText("");
    } catch (error) {
      logError(error as Error, {
        component: "SellerReviews.handleSubmitResponse",
        metadata: { reviewId: respondingTo },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredReviews = reviews.filter((review) => {
    if (
      searchTerm &&
      !review.content.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !review.userName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !review.title?.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
          />
        ))}
      </div>
    );
  };

  if (error) {
    return <PageState.Error message={error.message} onRetry={loadReviews} />;
  }

  if (isLoading && reviews.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6" />
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-24 bg-gray-200 dark:bg-gray-700 rounded"
              />
            ))}
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-gray-200 dark:bg-gray-700 rounded"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <Link
              href="/seller"
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              Seller Dashboard
            </Link>
            <span>/</span>
            <span>Reviews</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Product Reviews
          </h1>
        </div>
        <Link
          href="/seller"
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Avg. Rating
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.averageRating.toFixed(1)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Reviews
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalReviews}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Needs Response
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.pendingResponses}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Response Rate
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.respondedPercentage}%
          </p>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-6">
        <h3 className="font-medium text-gray-900 dark:text-white mb-3">
          Rating Distribution
        </h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = stats.ratingDistribution[rating] || 0;
            const percentage =
              stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
            return (
              <div key={rating} className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setRatingFilter(
                      ratingFilter === rating.toString()
                        ? ""
                        : rating.toString()
                    )
                  }
                  className={`flex items-center gap-1 w-16 ${
                    ratingFilter === rating.toString()
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {rating}
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </button>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400 w-12 text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <FormInput
              id="review-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search reviews..."
              leftIcon={<Search className="h-5 w-5" />}
            />
          </div>

          {/* Product Filter */}
          <FormSelect
            id="product-filter"
            value={selectedProduct}
            onChange={(e) => {
              setSelectedProduct(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: "", label: "All Products" },
              ...products.map((product) => ({
                value: product.id,
                label: product.name,
              })),
            ]}
            compact
          />

          {/* Status Filter */}
          <FormSelect
            id="status-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={[
              { value: "all", label: "All Reviews" },
              { value: "needs-response", label: "Needs Response" },
              { value: "published", label: "Published" },
              { value: "pending", label: "Pending" },
            ]}
            compact
          />

          {/* Clear Filters */}
          {(selectedProduct || ratingFilter || statusFilter !== "all") && (
            <button
              onClick={() => {
                setSelectedProduct("");
                setRatingFilter("");
                setStatusFilter("all");
                setCurrentPage(1);
              }}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No reviews found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || selectedProduct || ratingFilter
                ? "Try adjusting your filters"
                : "Your products haven't received any reviews yet"}
            </p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
            >
              {/* Review Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  {/* Product Image */}
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 relative">
                    {review.productImage ? (
                      <OptimizedImage
                        src={review.productImage}
                        alt={review.productName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div>
                    <Link
                      href={`/products/${review.productSlug}`}
                      className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {review.productName}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        by {review.userName}
                      </span>
                      {review.verifiedPurchase && (
                        <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {review.createdAt &&
                      formatDistanceToNow(new Date(review.createdAt), {
                        addSuffix: true,
                      })}
                  </span>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <ThumbsUp className="w-3 h-3" />
                    {review.helpfulCount}
                  </div>
                </div>
              </div>

              {/* Review Content */}
              {review.title && (
                <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                  {review.title}
                </h4>
              )}
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                {review.content}
              </p>

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="flex gap-2 mb-3">
                  {review.images.map((img, idx) => (
                    <div
                      key={idx}
                      className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 relative"
                    >
                      <OptimizedImage
                        src={img}
                        alt={`Review image ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Seller Response */}
              {review.sellerResponse ? (
                <div className="mt-3 pl-4 border-l-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                      Your Response
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {review.sellerResponse.respondedAt &&
                        formatDistanceToNow(
                          new Date(review.sellerResponse.respondedAt),
                          { addSuffix: true }
                        )}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {review.sellerResponse.content}
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setRespondingTo(review);
                    setResponseText("");
                  }}
                  className="mt-3 flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  <MessageSquare className="w-4 h-4" />
                  Respond to review
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <SimplePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className="mt-6"
      />

      {/* Response Modal */}
      {respondingTo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Respond to Review
              </h3>
              <button
                onClick={() => setRespondingTo(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Original Review */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 mb-2">
                {renderStars(respondingTo.rating)}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  by {respondingTo.userName}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {respondingTo.content}
              </p>
            </div>

            {/* Response Input */}
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Write your response..."
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
            />

            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Your response will be public
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setRespondingTo(null)}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRespond}
                  disabled={!responseText.trim() || submitting}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? "Sending..." : "Send Response"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
