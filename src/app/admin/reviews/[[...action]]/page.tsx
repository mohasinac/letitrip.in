"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApiQuery, useApiMutation } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS, THEME_CONSTANTS, ROUTES, UI_LABELS } from "@/constants";
import {
  Card,
  Button,
  DataTable,
  AdminPageHeader,
  getReviewTableColumns,
  ReviewRowActions,
  ReviewDetailView,
} from "@/components";
import { useToast } from "@/components";
import type { Review, ReviewStatus } from "@/components";

interface PageProps {
  params: Promise<{ action?: string[] }>;
}

export default function AdminReviewsPage({ params }: PageProps) {
  const { action } = use(params);
  const router = useRouter();
  const REVIEWS = UI_LABELS.ADMIN.REVIEWS;
  const { showToast } = useToast();
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

  const findReviewById = useCallback(
    (id: string): Review | undefined => reviews.find((r) => r.id === id),
    [reviews],
  );

  const handleViewReview = useCallback(
    (review: Review) => {
      setSelectedReview(review);
      if (review.id && action?.[0] !== "view") {
        router.push(`${ROUTES.ADMIN.REVIEWS}/view/${review.id}`);
      }
    },
    [action, router],
  );

  const handleBackToList = useCallback(() => {
    setSelectedReview(null);
    if (action?.[0]) {
      router.replace(ROUTES.ADMIN.REVIEWS);
    }
  }, [action, router]);

  // Auto-open review detail based on URL action: /view/:id
  useEffect(() => {
    if (!action?.[0] || selectedReview) return;

    const mode = action[0];
    const id = action[1];

    if (mode === "view" && id && reviews.length > 0) {
      const review = findReviewById(id);
      if (review) {
        handleViewReview(review);
      } else {
        router.replace(ROUTES.ADMIN.REVIEWS);
      }
    }
  }, [
    action,
    reviews,
    findReviewById,
    selectedReview,
    handleViewReview,
    router,
  ]);

  const handleApprove = async (review: Review) => {
    try {
      await updateStatusMutation.mutate({
        id: review.id,
        data: { status: "approved" },
      });
      await refetch();
      handleBackToList();
    } catch (err) {
      showToast(REVIEWS.APPROVE_FAILED, "error");
    }
  };

  const handleReject = async (review: Review) => {
    const reason = prompt(`${REVIEWS.REJECTION_REASON}:`);
    try {
      await updateStatusMutation.mutate({
        id: review.id,
        data: { status: "rejected", rejectionReason: reason },
      });
      await refetch();
      handleBackToList();
    } catch (err) {
      showToast(REVIEWS.REJECT_FAILED, "error");
    }
  };

  const handleDelete = async (review: Review) => {
    if (!confirm(`${REVIEWS.DELETE} - ${review.userName}?`)) return;
    try {
      await deleteMutation.mutate(review.id);
      await refetch();
      handleBackToList();
    } catch (err) {
      showToast(REVIEWS.DELETE_FAILED, "error");
    }
  };

  const handleBulkApprove = async () => {
    const pendingReviews = reviews.filter((r) => r.status === "pending");
    if (pendingReviews.length === 0) {
      showToast(REVIEWS.NO_PENDING, "warning");
      return;
    }
    if (!confirm(`${REVIEWS.APPROVE_ALL} (${pendingReviews.length})?`)) return;

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
    } catch (err) {
      showToast(REVIEWS.APPROVE_FAILED, "error");
    }
  };

  const tableColumns = getReviewTableColumns();

  if (selectedReview) {
    return (
      <ReviewDetailView
        review={selectedReview}
        onBack={handleBackToList}
        onApprove={handleApprove}
        onReject={handleReject}
        onDelete={handleDelete}
      />
    );
  }

  const pendingCount = reviews.filter((r) => r.status === "pending").length;

  return (
    <div className={THEME_CONSTANTS.spacing.stack}>
      <AdminPageHeader
        title={REVIEWS.TITLE}
        subtitle={`${REVIEWS.SUBTITLE} (${total} total)`}
        actionLabel={REVIEWS.APPROVE_ALL}
        onAction={handleBulkApprove}
        actionDisabled={pendingCount === 0}
      />

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label
              className={`block text-sm font-medium ${THEME_CONSTANTS.themed.textPrimary} mb-2`}
            >
              {UI_LABELS.TABLE.STATUS}
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ReviewStatus)}
              className={THEME_CONSTANTS.patterns.adminInput}
            >
              <option value="all">{UI_LABELS.STATUS.ALL}</option>
              <option value="pending">{REVIEWS.PENDING}</option>
              <option value="approved">{REVIEWS.APPROVED}</option>
              <option value="rejected">{REVIEWS.REJECTED}</option>
            </select>
          </div>

          <div>
            <label
              className={`block text-sm font-medium ${THEME_CONSTANTS.themed.textPrimary} mb-2`}
            >
              {REVIEWS.RATING}
            </label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className={THEME_CONSTANTS.patterns.adminInput}
            >
              <option value="all">{REVIEWS.ALL_RATINGS}</option>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={String(n)}>
                  {n} {n === 1 ? "Star" : "Stars"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className={`block text-sm font-medium ${THEME_CONSTANTS.themed.textPrimary} mb-2`}
            >
              {UI_LABELS.ACTIONS.SEARCH}
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={REVIEWS.SEARCH_PLACEHOLDER}
              className={THEME_CONSTANTS.patterns.adminInput}
            />
          </div>
        </div>
      </Card>

      {isLoading ? (
        <Card>
          <div className="text-center py-8">{UI_LABELS.LOADING.DEFAULT}</div>
        </Card>
      ) : error ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error.message}</p>
            <Button onClick={() => refetch()}>{UI_LABELS.ACTIONS.RETRY}</Button>
          </div>
        </Card>
      ) : (
        <DataTable
          data={reviews}
          columns={tableColumns}
          keyExtractor={(review) => review.id}
          onRowClick={(review) => handleViewReview(review)}
          actions={(review) => (
            <ReviewRowActions
              review={review}
              onApprove={handleApprove}
              onReject={handleReject}
              onDelete={handleDelete}
            />
          )}
        />
      )}
    </div>
  );
}
