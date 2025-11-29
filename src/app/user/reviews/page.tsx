"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  Edit,
  Trash2,
  Package,
  Store,
  Clock,
  ThumbsUp,
  Search,
  Loader2,
  AlertCircle,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { reviewsService } from "@/services/reviews.service";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import type { ReviewFE } from "@/types/frontend/review.types";

// Filter options
const STATUS_FILTERS = [
  { value: "all", label: "All Reviews" },
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
];

const RATING_FILTERS = [
  { value: 0, label: "All Ratings" },
  { value: 5, label: "5 Stars" },
  { value: 4, label: "4 Stars" },
  { value: 3, label: "3 Stars" },
  { value: 2, label: "2 Stars" },
  { value: 1, label: "1 Star" },
];

// Stars component
function Stars({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  const sizeClasses = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses} ${
            star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

// Review card component
function ReviewCard({
  review,
  onEdit,
  onDelete,
}: {
  review: ReviewFE;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle className="h-3 w-3" /> Approved
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            <Clock className="h-3 w-3" /> Pending
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <AlertCircle className="h-3 w-3" /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const getItemLink = () => {
    if (review.productId) {
      return `/products/${review.productId}`;
    }
    if (review.shopId) {
      return `/shops/${review.shopId}`;
    }
    return "#";
  };

  const getItemIcon = () => {
    if (review.shopId) {
      return <Store className="h-4 w-4 text-purple-500" />;
    }
    return <Package className="h-4 w-4 text-blue-500" />;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Product/Auction Image */}
            <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
              {review.images && review.images.length > 0 ? (
                <img
                  src={review.images[0]}
                  alt="Review"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {getItemIcon()}
                </div>
              )}
            </div>
            <div>
              <Link
                href={getItemLink()}
                className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1"
              >
                {review.productId ? "Product Review" : "Shop Review"}
              </Link>
              <div className="flex items-center gap-2 mt-1">
                <Stars rating={review.rating} />
                <span className="text-sm text-gray-500">
                  {formatDate(review.createdAt)}
                </span>
              </div>
            </div>
          </div>
          {getStatusBadge(review.status)}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {review.title && (
          <h4 className="font-medium text-gray-900 mb-2">{review.title}</h4>
        )}
        <p className="text-gray-600 text-sm line-clamp-3">{review.comment}</p>

        {/* Review Images */}
        {review.images && review.images.length > 0 && (
          <div className="flex gap-2 mt-3">
            {review.images.slice(0, 4).map((image, index) => (
              <div
                key={index}
                className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100"
              >
                <img
                  src={image}
                  alt={`Review image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {index === 3 && review.images && review.images.length > 4 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      +{review.images.length - 4}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-4 w-4" />
            <span>{review.helpfulCount || 0} helpful</span>
          </div>
          {review.verifiedPurchase && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Verified Purchase</span>
            </div>
          )}
        </div>

        {/* Seller Response */}
        {review.replyText && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs font-medium text-blue-800 mb-1">
              Seller Response:
            </p>
            <p className="text-sm text-blue-700">{review.replyText}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2">
        <button
          onClick={() => onEdit(review.id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        >
          <Edit className="h-4 w-4" />
          Edit
        </button>
        <button
          onClick={() => onDelete(review.id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </button>
      </div>
    </div>
  );
}

export default function UserReviewsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [reviews, setReviews] = useState<ReviewFE[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    averageRating: 0,
  });

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);

      const filters: Record<string, any> = {
        userId: user?.id,
        limit: 50,
      };

      if (statusFilter === "approved") {
        filters.isApproved = true;
      } else if (statusFilter === "pending") {
        filters.isApproved = false;
      } else if (statusFilter === "rejected") {
        filters.isRejected = true;
      }

      if (ratingFilter > 0) {
        filters.rating = ratingFilter;
      }

      const response = await reviewsService.list(filters);
      setReviews(response.data || []);

      // Calculate stats
      const allReviews = response.data || [];
      const approvedCount = allReviews.filter(
        (r) => r.status === "approved"
      ).length;
      const pendingCount = allReviews.filter(
        (r) => r.status === "pending"
      ).length;
      const avgRating =
        allReviews.length > 0
          ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
          : 0;

      setStats({
        total: allReviews.length,
        approved: approvedCount,
        pending: pendingCount,
        averageRating: Math.round(avgRating * 10) / 10,
      });
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, statusFilter, ratingFilter]);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadReviews();
    }
  }, [authLoading, isAuthenticated, loadReviews]);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleting(true);
      await reviewsService.delete(deleteId);
      setReviews((prev) => prev.filter((r) => r.id !== deleteId));
      setDeleteId(null);
    } catch (error) {
      console.error("Failed to delete review:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (id: string) => {
    // Navigate to edit page or open modal
    router.push(`/user/reviews/${id}/edit`);
  };

  const filteredReviews = reviews.filter((review) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      review.title?.toLowerCase().includes(query) ||
      review.comment.toLowerCase().includes(query)
    );
  });

  // Auth check
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">
            Sign in to view your reviews
          </h3>
          <p className="mt-1 text-gray-500">
            You need to be signed in to access your reviews.
          </p>
          <Link
            href="/login?redirect=/user/reviews"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Review"
        description="Are you sure you want to delete this review? This action cannot be undone."
        variant="danger"
        confirmLabel="Delete"
        isLoading={deleting}
      />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Reviews</h1>
          <p className="mt-1 text-gray-600">
            Manage reviews you&apos;ve submitted for products and auctions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Reviews</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {stats.total}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Approved</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {stats.approved}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">
              {stats.pending}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Average Rating</p>
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span className="text-2xl font-bold text-gray-900">
                {stats.averageRating}
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reviews..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {STATUS_FILTERS.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>

            {/* Rating Filter */}
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {RATING_FILTERS.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">
              No reviews yet
            </h3>
            <p className="mt-1 text-gray-500">
              {searchQuery || statusFilter !== "all" || ratingFilter > 0
                ? "No reviews match your filters"
                : "You haven't written any reviews yet"}
            </p>
            <Link
              href="/orders"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              View Orders
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onEdit={handleEdit}
                onDelete={(id) => setDeleteId(id)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
