/**
 * AdminReviewsView
 *
 * Contains all review management state, mutations, handlers, and JSX.
 * Consumed by /admin/reviews/[[...action]]/page.tsx.
 * Uses unified ListingLayout with FilterFacetSection, Search, SortDropdown.
 */

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { usePendingTable } from "@/hooks";
import { buildSieveFilters } from "@/helpers";
import { useRouter } from "@/i18n/navigation";
import { useUrlTable } from "@/hooks";
import { THEME_CONSTANTS, ROUTES, SUCCESS_MESSAGES } from "@/constants";
import { useAdminReviews } from "@/features/admin/hooks";

const { flex } = THEME_CONSTANTS;
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
  ListingLayout,
  REVIEW_SORT_OPTIONS,
  ReviewFilters,
  Search,
  SortDropdown,
} from "@/components";
import { useToast } from "@/components";
import { SideDrawer, ConfirmDeleteModal, Text, Textarea } from "@/components";
import { getReviewTableColumns, ReviewRowActions, ReviewDetailView } from ".";
import type { Review, ReviewStatus } from ".";

interface AdminReviewsViewProps {
  action?: string[];
}

export function AdminReviewsView({ action }: AdminReviewsViewProps) {
  const router = useRouter();
  const t = useTranslations("adminReviews");
  const tActions = useTranslations("actions");
  const tLoading = useTranslations("loading");
  const { showToast } = useToast();
  const table = useUrlTable({
    defaults: { pageSize: "25", sort: "-createdAt", status: "pending" },
  });
  const statusFilter = (table.get("status") || "pending") as ReviewStatus;
  const ratingFilter = table.get("rating");
  const searchTerm = table.get("q");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  const [rejectModal, setRejectModal] = useState<{
    open: boolean;
    review: Review | null;
    reason: string;
  }>({ open: false, review: null, reason: "" });

  const [deleteConfirm, setDeleteConfirm] = useState<Review | null>(null);
  const [bulkApproveConfirm, setBulkApproveConfirm] = useState(false);

  // ── Pending filter state (staged until Apply is clicked) ─────────────
  const { pendingTable, filterActiveCount, onFilterApply, onFilterClear } =
    usePendingTable(table, ["status", "rating", "verified", "featured"]);

  const verifiedFilter = table.get("verified");
  const featuredFilter = table.get("featured");

  // Build Sieve filter string
  const filtersParam = buildSieveFilters(
    [
      "status==",
      statusFilter && statusFilter !== "all" ? statusFilter : undefined,
    ],
    ["rating==", ratingFilter],
    ["(userName|userEmail)@=*", searchTerm],
    [
      "verified==",
      verifiedFilter === "true"
        ? "true"
        : verifiedFilter === "false"
          ? "false"
          : undefined,
    ],
    ["featured==", featuredFilter === "true" ? "true" : undefined],
  );

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
      await updateStatusMutation.mutateAsync({
        id: review.id,
        data: { status: "approved" },
      });
      await refetch();
      showToast(SUCCESS_MESSAGES.REVIEW.APPROVED, "success");
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
      await updateStatusMutation.mutateAsync({
        id: review.id,
        data: { status: "rejected", rejectionReason: reason },
      });
      await refetch();
      showToast(SUCCESS_MESSAGES.REVIEW.REJECTED, "success");
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
      await deleteMutation.mutateAsync(deleteConfirm.id);
      await refetch();
      showToast(SUCCESS_MESSAGES.REVIEW.DELETED, "success");
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
          updateStatusMutation.mutateAsync({
            id: review.id,
            data: { status: "approved" },
          }),
        ),
      );
      await refetch();
      showToast(SUCCESS_MESSAGES.REVIEW.BULK_APPROVED, "success");
    } catch {
      showToast(t("approveFailed"), "error");
    }
  };

  const tableColumns = getReviewTableColumns();
  const pendingCount = reviews.filter((r) => r.status === "pending").length;

  const sortOptions = useMemo(
    () => REVIEW_SORT_OPTIONS.map((o) => ({ value: o.value, label: t(o.key) })),
    [t],
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
        filterContent={<ReviewFilters table={pendingTable} />}
        filterActiveCount={filterActiveCount}
        onFilterApply={onFilterApply}
        onFilterClear={onFilterClear}
        toolbarPaginationSlot={
          <TablePagination
            currentPage={data?.meta?.page ?? 1}
            totalPages={data?.meta?.totalPages ?? 1}
            pageSize={table.getNumber("pageSize", 25)}
            total={total}
            onPageChange={table.setPage}
            compact
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
                <Button variant="outline" onClick={() => refetch()}>
                  {tActions("retry")}
                </Button>
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
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
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
              <div className={`${flex.between}`}>
                <Badge>
                  {"★".repeat(review.rating)}
                  {"☆".repeat(5 - review.rating)}
                </Badge>
                <StatusBadge status={review.status as any} />
              </div>
              <Caption className="line-clamp-2">{review.comment}</Caption>
            </Card>
          )}
        />
      </ListingLayout>

      {/* Reject drawer */}
      <SideDrawer
        isOpen={rejectModal.open}
        onClose={() =>
          setRejectModal({ open: false, review: null, reason: "" })
        }
        title={t("rejectionReason")}
        mode="edit"
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
          <div className="flex gap-3 justify-start">
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
      </SideDrawer>

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
