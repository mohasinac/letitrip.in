"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useApiQuery, useApiMutation, useUrlTable } from "@/hooks";
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
  TablePagination,
} from "@/components";
import { useToast } from "@/components";
import { Modal, ConfirmDeleteModal } from "@/components";
import type { Review, ReviewStatus } from "@/components";

interface PageProps {
  params: Promise<{ action?: string[] }>;
}

export default function AdminReviewsPage({ params }: PageProps) {
  const { action } = use(params);
  const router = useRouter();
  const REVIEWS = UI_LABELS.ADMIN.REVIEWS;
  const { showToast } = useToast();
  const table = useUrlTable({
    defaults: { pageSize: "25", sort: "-createdAt", status: "pending" },
  });
  const statusFilter = (table.get("status") || "pending") as ReviewStatus;
  const ratingFilter = table.get("rating") || "all";
  const searchTerm = table.get("q");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  // Modal state for reject (replaces prompt())
  const [rejectModal, setRejectModal] = useState<{
    open: boolean;
    review: Review | null;
    reason: string;
  }>({ open: false, review: null, reason: "" });

  // Confirm-delete modal state (replaces confirm())
  const [deleteConfirm, setDeleteConfirm] = useState<Review | null>(null);
  const [bulkApproveConfirm, setBulkApproveConfirm] = useState(false);

  // Build Sieve filter string
  const filtersArr: string[] = [];
  if (statusFilter !== "all") filtersArr.push(`status==${statusFilter}`);
  if (ratingFilter !== "all") filtersArr.push(`rating==${ratingFilter}`);
  if (searchTerm) filtersArr.push(`(userName|userEmail)@=*${searchTerm}`);
  const filtersParam = filtersArr.join(",");

  const { data, isLoading, error, refetch } = useApiQuery<{
    reviews: Review[];
    meta: { total: number; page: number; pageSize: number; totalPages: number };
  }>({
    queryKey: ["admin", "reviews", table.params.toString()],
    queryFn: () =>
      apiClient.get(
        `${API_ENDPOINTS.ADMIN.REVIEWS}${table.buildSieveParams(filtersParam)}`,
      ),
  });

  const updateStatusMutation = useApiMutation<any, { id: string; data: any }>({
    mutationFn: ({ id, data }) =>
      apiClient.patch(`${API_ENDPOINTS.REVIEWS.LIST}/${id}`, data),
  });

  const deleteMutation = useApiMutation<any, string>({
    mutationFn: (id) => apiClient.delete(`${API_ENDPOINTS.REVIEWS.LIST}/${id}`),
  });

  const reviews = data?.reviews || [];
  const total = data?.meta?.total || 0;

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

  const handleReject = (review: Review) => {
    setRejectModal({ open: true, review, reason: "" });
  };

  const confirmReject = async () => {
    const { review, reason } = rejectModal;
    if (!review) return;
    try {
      await updateStatusMutation.mutate({
        id: review.id,
        data: { status: "rejected", rejectionReason: reason },
      });
      await refetch();
      handleBackToList();
    } catch (err) {
      showToast(REVIEWS.REJECT_FAILED, "error");
    } finally {
      setRejectModal({ open: false, review: null, reason: "" });
    }
  };

  const handleDelete = (review: Review) => {
    setDeleteConfirm(review);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteMutation.mutate(deleteConfirm.id);
      await refetch();
      handleBackToList();
    } catch (err) {
      showToast(REVIEWS.DELETE_FAILED, "error");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleBulkApprove = () => {
    const pendingReviews = reviews.filter((r) => r.status === "pending");
    if (pendingReviews.length === 0) {
      showToast(REVIEWS.NO_PENDING, "warning");
      return;
    }
    setBulkApproveConfirm(true);
  };

  const confirmBulkApprove = async () => {
    setBulkApproveConfirm(false);
    const pendingReviews = reviews.filter((r) => r.status === "pending");
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
  const pendingCount = reviews.filter((r) => r.status === "pending").length;

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
              onChange={(e) =>
                table.set("status", e.target.value as ReviewStatus)
              }
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
              onChange={(e) => table.set("rating", e.target.value)}
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
              onChange={(e) => table.set("q", e.target.value)}
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
        <>
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
            externalPagination
          />
          <TablePagination
            currentPage={data?.meta?.page ?? 1}
            totalPages={data?.meta?.totalPages ?? 1}
            pageSize={table.getNumber("pageSize", 25)}
            total={total}
            onPageChange={table.setPage}
            onPageSizeChange={table.setPageSize}
          />
        </>
      )}

      {/* Reject modal — replaces prompt() */}
      <Modal
        isOpen={rejectModal.open}
        onClose={() =>
          setRejectModal({ open: false, review: null, reason: "" })
        }
        title={REVIEWS.REJECTION_REASON}
      >
        <div className={THEME_CONSTANTS.spacing.stack}>
          <textarea
            className={THEME_CONSTANTS.input.base}
            rows={4}
            value={rejectModal.reason}
            onChange={(e) =>
              setRejectModal((prev) => ({ ...prev, reason: e.target.value }))
            }
            placeholder="Enter rejection reason..."
          />
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() =>
                setRejectModal({ open: false, review: null, reason: "" })
              }
            >
              {UI_LABELS.ACTIONS.CANCEL}
            </Button>
            <Button variant="danger" onClick={confirmReject}>
              {UI_LABELS.ACTIONS.CONFIRM}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation — replaces confirm() */}
      <ConfirmDeleteModal
        isOpen={!!deleteConfirm}
        onConfirm={confirmDelete}
        onClose={() => setDeleteConfirm(null)}
        title={REVIEWS.DELETE}
        message={
          deleteConfirm ? `${REVIEWS.DELETE} - ${deleteConfirm.userName}?` : ""
        }
      />

      {/* Bulk approve confirmation — replaces confirm() */}
      <ConfirmDeleteModal
        isOpen={bulkApproveConfirm}
        onConfirm={confirmBulkApprove}
        onClose={() => setBulkApproveConfirm(false)}
        title={REVIEWS.APPROVE_ALL}
        message={`${REVIEWS.APPROVE_ALL} (${pendingCount})?`}
        confirmText={UI_LABELS.ACTIONS.CONFIRM}
      />
    </div>
  );
}
