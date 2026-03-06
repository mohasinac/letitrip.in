/**
 * AdminReviewsView
 *
 * Contains all review management state, mutations, handlers, and JSX.
 * Consumed by /admin/reviews/[[...action]]/page.tsx.
 * Uses unified ListingLayout with FilterFacetSection, Search, SortDropdown.
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import { useUrlTable } from "@/hooks";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { useAdminReviews } from "@/features/admin/hooks";
import { useTranslations } from "next-intl";
import {
  Badge,
  Caption,
  Card,
  Button,
  DataTable,
  AdminPageHeader,
  StatusBadge,
  TablePagination,
  FilterFacetSection,
  ListingLayout,
  Search,
  SortDropdown,
} from "@/components";
import { useToast } from "@/components";
import {
  Modal,
  ConfirmDeleteModal,
  Text,
  Textarea,
} from "@/components";
import { getReviewTableColumns, ReviewRowActions, ReviewDetailView } from ".";
import type { Review, ReviewStatus } from ".";

const REVIEW_SORT_OPTIONS_KEYS = [
  { value: "-createdAt", key: "sortNewest" },
  { value: "createdAt", key: "sortOldest" },
  { value: "-rating", key: "sortHighestRated" },
  { value: "rating", key: "sortLowestRated" },
] as const;

interface AdminReviewsViewProps {
  action?: string[];
}

export function AdminReviewsView({ action }: AdminReviewsViewProps) {
  const router = useRouter();
  const t = useTranslations("adminReviews");
  const tActions = useTranslations("actions");
  const tLoading = useTranslations("loading");
  const tStatus = useTranslations("status");
  const { showToast } = useToast();
  const table = useUrlTable({
    defaults: { pageSize: "25", sort: "-createdAt", status: "pending" },
  });
  const statusFilter = (table.get("status") || "pending") as ReviewStatus;
  const ratingFilter = table.get("rating") || "all";
  const searchTerm = table.get("q");
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const [rejectModal, setRejectModal] = useState<{
    open: boolean;
    review: Review | null;
    reason: string;
  }>({ open: false, review: null, reason: "" });

  const [deleteConfirm, setDeleteConfirm] = useState<Review | null>(null);
  const [bulkApproveConfirm, setBulkApproveConfirm] = useState(false);

  // ── Staged filter state ──────────────────────────────────────────────
  const [stagedStatus, setStagedStatus] = useState<string[]>(
    statusFilter && statusFilter !== "all" ? [statusFilter] : [],
  );
  const [stagedRating, setStagedRating] = useState<string[]>(
    ratingFilter && ratingFilter !== "all" ? [ratingFilter] : [],
  );

  const handleFilterApply = useCallback(() => {
    table.setMany({
      status: stagedStatus[0] ?? "",
      rating: stagedRating[0] ?? "",
      page: "1",
    });
  }, [stagedStatus, stagedRating, table]);

  const handleFilterClear = useCallback(() => {
    setStagedStatus([]);
    setStagedRating([]);
    table.setMany({ status: "", rating: "", page: "1" });
  }, [table]);

  const filterActiveCount =
    (statusFilter && statusFilter !== "all" ? 1 : 0) +
    (ratingFilter && ratingFilter !== "all" ? 1 : 0);

  // Build Sieve filter string
  const filtersArr: string[] = [];
  if (statusFilter !== "all" && statusFilter) filtersArr.push(`status==${statusFilter}`);
  if (ratingFilter !== "all" && ratingFilter) filtersArr.push(`rating==${ratingFilter}`);
  if (searchTerm) filtersArr.push(`(userName|userEmail)@=*${searchTerm}`);
  const filtersParam = filtersArr.join(",");

  const {
    data,
    isLoading,
    error,
    refetch,
    updateMutation: updateStatusMutation,
    deleteMutation,
  } = useAdminReviews(table.buildSieveParams(filtersParam));

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
    } catch {
      showToast(t("approveFailed"), "error");
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
    } catch {
      showToast(t("rejectFailed"), "error");
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
    } catch {
      showToast(t("deleteFailed"), "error");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleBulkApprove = () => {
    const pendingReviews = reviews.filter((r) => r.status === "pending");
    if (pendingReviews.length === 0) {
      showToast(t("noPending"), "warning");
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
    } catch {
      showToast(t("approveFailed"), "error");
    }
  };

  const tableColumns = getReviewTableColumns();
  const pendingCount = reviews.filter((r) => r.status === "pending").length;

  const sortOptions = useMemo(
    () =>
      REVIEW_SORT_OPTIONS_KEYS.map((o) => ({
        value: o.value,
        label: t(o.key),
      })),
    [t],
  );

  const statusOptions = useMemo(
    () => [
      { value: "pending", label: t("pending") },
      { value: "approved", label: t("approved") },
      { value: "rejected", label: t("rejected") },
    ],
    [t],
  );

  const ratingOptions = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((n) => ({
        value: String(n),
        label: `${n} ${n === 1 ? "Star" : "Stars"}`,
      })),
    [],
  );

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
    <>
      <ListingLayout
        headerSlot={
          <AdminPageHeader
            title={t("title")}
            subtitle={`${t("subtitle")} (${total} total)`}
            actionLabel={t("approveAll")}
            onAction={handleBulkApprove}
            actionDisabled={pendingCount === 0}
          />
        }
        searchSlot={
          <Search
            value={table.get("q")}
            onChange={(v) => table.set("q", v)}
            placeholder={t("searchPlaceholder")}
            onClear={() => table.set("q", "")}
          />
        }
        sortSlot={
          <SortDropdown
            value={table.get("sort") || "-createdAt"}
            onChange={(v) => table.set("sort", v)}
            options={sortOptions}
          />
        }
        filterContent={
          <>
            <FilterFacetSection
              title={tStatus("all")}
              options={statusOptions}
              selected={stagedStatus}
              onChange={setStagedStatus}
              searchable={false}
            />
            <FilterFacetSection
              title={t("rating")}
              options={ratingOptions}
              selected={stagedRating}
              onChange={setStagedRating}
              searchable={false}
            />
          </>
        }
        filterActiveCount={filterActiveCount}
        onFilterApply={handleFilterApply}
        onFilterClear={handleFilterClear}
        paginationSlot={
          <TablePagination
            currentPage={data?.meta?.page ?? 1}
            totalPages={data?.meta?.totalPages ?? 1}
            pageSize={table.getNumber("pageSize", 25)}
            total={total}
            onPageChange={table.setPage}
            onPageSizeChange={table.setPageSize}
          />
        }
        loading={isLoading}
        errorSlot={
          error ? (
            <Card>
              <div className="text-center py-8">
                <Text variant="error" className="mb-4">
                  {error.message}
                </Text>
                <Button onClick={() => refetch()}>{tActions("retry")}</Button>
              </div>
            </Card>
          ) : undefined
        }
      >
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
          showViewToggle
          viewMode={(table.get("view") || "table") as "table" | "grid" | "list"}
          onViewModeChange={(mode) => table.set("view", mode)}
          mobileCardRender={(review) => (
            <Card
              className="p-4 space-y-2 cursor-pointer"
              onClick={() => handleViewReview(review)}
            >
              <Text weight="medium" size="sm" className="line-clamp-1">
                {review.productName}
              </Text>
              <Caption>{review.userName}</Caption>
              <div className="flex items-center justify-between">
                <Badge>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</Badge>
                <StatusBadge status={review.status as any} />
              </div>
              <Caption className="line-clamp-2">{review.comment}</Caption>
            </Card>
          )}
        />
      </ListingLayout>

      {/* Reject modal */}
      <Modal
        isOpen={rejectModal.open}
        onClose={() =>
          setRejectModal({ open: false, review: null, reason: "" })
        }
        title={t("rejectionReason")}
      >
        <div className={THEME_CONSTANTS.spacing.stack}>
          <Textarea
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
              {tActions("cancel")}
            </Button>
            <Button variant="danger" onClick={confirmReject}>
              {tActions("confirm")}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDeleteModal
        isOpen={!!deleteConfirm}
        onConfirm={confirmDelete}
        onClose={() => setDeleteConfirm(null)}
        title={tActions("delete")}
        message={
          deleteConfirm
            ? `${tActions("delete")} - ${deleteConfirm.userName}?`
            : ""
        }
      />

      {/* Bulk approve confirmation */}
      <ConfirmDeleteModal
        isOpen={bulkApproveConfirm}
        onConfirm={confirmBulkApprove}
        onClose={() => setBulkApproveConfirm(false)}
        title={t("approveAll")}
        message={`${t("approveAll")} (${pendingCount})?`}
        confirmText={tActions("confirm")}
      />
    </>
  );
}
