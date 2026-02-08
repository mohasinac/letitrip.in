"use client";

import { useState } from "react";
import { useApiQuery, useApiMutation } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS, THEME_CONSTANTS } from "@/constants";
import { DataTable } from "@/components/admin";
import { Card, Button } from "@/components";
import { formatDate } from "@/utils";

interface Review {
  id: string;
  productId: string;
  productName: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  verifiedPurchase: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

type ReviewStatus = "all" | "pending" | "approved" | "rejected";

export default function AdminReviewsPage() {
  const [statusFilter, setStatusFilter] = useState<ReviewStatus>("pending");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const queryParams = new URLSearchParams();
  if (statusFilter !== "all") queryParams.append("status", statusFilter);
  if (ratingFilter !== "all") queryParams.append("rating", ratingFilter);
  if (searchTerm) queryParams.append("search", searchTerm);

  const { data, isLoading, error, refetch } = useApiQuery<{
    reviews: Review[];
    total: number;
  }>({
    queryKey: ["reviews", "list", statusFilter, ratingFilter, searchTerm],
    queryFn: () =>
      apiClient.get(`${API_ENDPOINTS.REVIEWS.LIST}?${queryParams.toString()}`),
  });

  const updateStatusMutation = useApiMutation<any, { id: string; data: any }>({
    mutationFn: ({ id, data }) =>
      apiClient.patch(`${API_ENDPOINTS.REVIEWS.LIST}/${id}`, data),
  });

  const deleteMutation = useApiMutation<any, string>({
    mutationFn: (id) => apiClient.delete(`${API_ENDPOINTS.REVIEWS.LIST}/${id}`),
  });

  const reviews = data?.reviews || [];
  const total = data?.total || 0;

  const handleApprove = async (review: Review) => {
    try {
      await updateStatusMutation.mutate({
        id: review.id,
        data: { status: "approved" },
      });
      await refetch();
      setSelectedReview(null);
    } catch (err) {
      alert("Failed to approve review");
    }
  };

  const handleReject = async (review: Review) => {
    const reason = prompt("Reason for rejection (optional):");
    try {
      await updateStatusMutation.mutate({
        id: review.id,
        data: { status: "rejected", rejectionReason: reason },
      });
      await refetch();
      setSelectedReview(null);
    } catch (err) {
      alert("Failed to reject review");
    }
  };

  const handleDelete = async (review: Review) => {
    if (!confirm(`Permanently delete review by ${review.userName}?`)) return;
    try {
      await deleteMutation.mutate(review.id);
      await refetch();
      setSelectedReview(null);
    } catch (err) {
      alert("Failed to delete review");
    }
  };

  const handleBulkApprove = async () => {
    const pendingReviews = reviews.filter((r) => r.status === "pending");
    if (pendingReviews.length === 0) {
      alert("No pending reviews to approve");
      return;
    }
    if (!confirm(`Approve ${pendingReviews.length} pending reviews?`)) return;

    try {
      await Promise.all(
        pendingReviews.map((review) =>
          updateStatusMutation.mutate({
            id: review.id,
            data: { status: "approved" },
          }),
        ),
      );
      await refetch();
      alert(`Approved ${pendingReviews.length} reviews`);
    } catch (err) {
      alert("Failed to approve some reviews");
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? "text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const tableColumns = [
    {
      key: "productName",
      header: "Product",
      sortable: true,
      width: "20%",
    },
    {
      key: "userName",
      header: "User",
      sortable: true,
      width: "15%",
      render: (review: Review) => (
        <div>
          <div>{review.userName}</div>
          {review.verifiedPurchase && (
            <span className="text-xs text-green-600 dark:text-green-400">
              ✓ Verified
            </span>
          )}
        </div>
      ),
    },
    {
      key: "rating",
      header: "Rating",
      sortable: true,
      width: "12%",
      render: (review: Review) => (
        <div className="flex items-center gap-2">
          {renderStars(review.rating)}
          <span className={`text-sm ${THEME_CONSTANTS.themed.textSecondary}`}>
            ({review.rating})
          </span>
        </div>
      ),
    },
    {
      key: "comment",
      header: "Comment",
      width: "25%",
      render: (review: Review) => (
        <div className="text-sm text-gray-700 dark:text-gray-300 truncate">
          {review.comment.substring(0, 80)}
          {review.comment.length > 80 && "..."}
        </div>
      ),
    },
    {
      key: "helpful",
      header: "Helpful",
      width: "10%",
      render: (review: Review) => {
        const total = review.helpfulCount + review.notHelpfulCount;
        const ratio =
          total > 0 ? Math.round((review.helpfulCount / total) * 100) : 0;
        return (
          <span className="text-sm">
            {review.helpfulCount}/{total} ({ratio}%)
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      width: "12%",
      render: (review: Review) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded ${
            review.status === "approved"
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : review.status === "rejected"
                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
          }`}
        >
          {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
        </span>
      ),
    },
  ];

  if (selectedReview) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1
            className={`text-2xl font-bold ${THEME_CONSTANTS.themed.textPrimary}`}
          >
            Review Details
          </h1>
          <Button onClick={() => setSelectedReview(null)} variant="secondary">
            Back to List
          </Button>
        </div>

        <Card>
          <div className={THEME_CONSTANTS.spacing.stack}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Product
                </label>
                <p className={THEME_CONSTANTS.themed.textPrimary}>
                  {selectedReview.productName}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  User
                </label>
                <p className={THEME_CONSTANTS.themed.textPrimary}>
                  {selectedReview.userName}
                  {selectedReview.verifiedPurchase && (
                    <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                      ✓ Verified Purchase
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Rating
              </label>
              <div className="flex items-center gap-2 mt-1">
                {renderStars(selectedReview.rating)}
                <span className={THEME_CONSTANTS.themed.textSecondary}>
                  ({selectedReview.rating}/5)
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Comment
              </label>
              <p
                className={`mt-1 ${THEME_CONSTANTS.themed.textPrimary} whitespace-pre-wrap`}
              >
                {selectedReview.comment}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Status
                </label>
                <p className="mt-1">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      selectedReview.status === "approved"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : selectedReview.status === "rejected"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    }`}
                  >
                    {selectedReview.status.charAt(0).toUpperCase() +
                      selectedReview.status.slice(1)}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Helpful Votes
                </label>
                <p className={THEME_CONSTANTS.themed.textPrimary}>
                  {selectedReview.helpfulCount} helpful,{" "}
                  {selectedReview.notHelpfulCount} not helpful
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Created
                </label>
                <p className={THEME_CONSTANTS.themed.textPrimary}>
                  {formatDate(selectedReview.createdAt)}
                </p>
              </div>
            </div>

            <div
              className={`flex gap-2 pt-4 border-t ${THEME_CONSTANTS.themed.borderColor}`}
            >
              {selectedReview.status !== "approved" && (
                <Button
                  onClick={() => handleApprove(selectedReview)}
                  variant="primary"
                >
                  Approve
                </Button>
              )}
              {selectedReview.status !== "rejected" && (
                <Button
                  onClick={() => handleReject(selectedReview)}
                  variant="secondary"
                >
                  Reject
                </Button>
              )}
              <Button
                onClick={() => handleDelete(selectedReview)}
                variant="secondary"
                className="text-red-600 hover:text-red-700"
              >
                Delete
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className={`text-2xl font-bold ${THEME_CONSTANTS.themed.textPrimary}`}
          >
            Reviews
          </h1>
          <p className={`text-sm ${THEME_CONSTANTS.themed.textSecondary} mt-1`}>
            Moderate product reviews ({total} total)
          </p>
        </div>
        <Button
          onClick={handleBulkApprove}
          variant="primary"
          disabled={reviews.filter((r) => r.status === "pending").length === 0}
        >
          Approve All Pending
        </Button>
      </div>

      <Card>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ReviewStatus)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rating
            </label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products, users..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
            />
          </div>
        </div>
      </Card>

      {isLoading ? (
        <Card>
          <div className="text-center py-8">Loading reviews...</div>
        </Card>
      ) : error ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error.message}</p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        </Card>
      ) : (
        <DataTable
          data={reviews}
          columns={tableColumns}
          keyExtractor={(review) => review.id}
          onRowClick={(review) => setSelectedReview(review)}
          actions={(review) => (
            <div className="flex gap-2">
              {review.status !== "approved" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApprove(review);
                  }}
                  className="text-green-600 hover:text-green-800 dark:text-green-400 text-sm"
                >
                  Approve
                </button>
              )}
              {review.status !== "rejected" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReject(review);
                  }}
                  className="text-orange-600 hover:text-orange-800 dark:text-orange-400 text-sm"
                >
                  Reject
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(review);
                }}
                className="text-red-600 hover:text-red-800 dark:text-red-400 text-sm"
              >
                Delete
              </button>
            </div>
          )}
        />
      )}
    </div>
  );
}
