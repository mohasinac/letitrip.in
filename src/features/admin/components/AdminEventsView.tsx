/**
 * AdminEventsView
 *
 * Tier 2 — feature component.
 * Extracted from src/app/[locale]/admin/events/page.tsx (was 153 lines).
 * Manages the admin events list with filtering, pagination, and CRUD.
 * Uses the unified ListingLayout shell.
 */

"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  AdminPageHeader,
  Badge,
  Button,
  Caption,
  Card,
  DataTable,
  FilterFacetSection,
  ListingLayout,
  MediaImage,
  Search,
  SortDropdown,
  StatusBadge,
  TablePagination,
  Text,
  ConfirmDeleteModal,
} from "@/components";
import { formatDate } from "@/utils";
import { ROUTES } from "@/constants";
import { useTranslations } from "next-intl";
import { useUrlTable, useMessage } from "@/hooks";
import {
  useEvents,
  useEventsTableColumns,
  EventFormDrawer,
  useDeleteEvent,
  useChangeEventStatus,
} from "@/features/events";
import type { EventDocument } from "@/db/schema";

const EVENT_SORT_OPTIONS_KEYS = [
  { value: "-createdAt", key: "sortNewest" },
  { value: "createdAt", key: "sortOldest" },
] as const;

export function AdminEventsView() {
  const { showSuccess, showError } = useMessage();
  const router = useRouter();
  const t = useTranslations("adminEvents");
  const tActions = useTranslations("actions");
  const tEventStatus = useTranslations("eventStatus");
  const table = useUrlTable({
    defaults: { pageSize: "25", sort: "-createdAt" },
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EventDocument | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EventDocument | null>(null);

  // ── Bulk selection state ────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // ── Staged filter state ──────────────────────────────────────────────
  const typeFilter = table.get("type");
  const statusFilter = table.get("status");
  const [stagedType, setStagedType] = useState<string[]>(
    typeFilter ? [typeFilter] : [],
  );
  const [stagedStatus, setStagedStatus] = useState<string[]>(
    statusFilter ? [statusFilter] : [],
  );

  const handleFilterApply = useCallback(() => {
    table.setMany({
      type: stagedType[0] ?? "",
      status: stagedStatus[0] ?? "",
      page: "1",
    });
  }, [stagedType, stagedStatus, table]);

  const handleFilterClear = useCallback(() => {
    setStagedType([]);
    setStagedStatus([]);
    table.setMany({ type: "", status: "", page: "1" });
  }, [table]);

  const filterActiveCount =
    (typeFilter ? 1 : 0) + (statusFilter ? 1 : 0);

  const params = table.params.toString();
  const { events, total, page, pageSize, totalPages, isLoading, refetch } =
    useEvents({ params });

  const deleteMutation = useDeleteEvent(() => {
    showSuccess(t("confirmDelete"));
    setDeleteTarget(null);
    refetch();
  });

  const changeStatusMutation = useChangeEventStatus(() => {
    refetch();
  });

  // ── Bulk action handlers ────────────────────────────────────────────
  const handleBulkStatusChange = useCallback(
    async (status: "active" | "paused" | "ended") => {
      if (selectedIds.length === 0) return;
      setIsBulkProcessing(true);
      try {
        await Promise.allSettled(
          selectedIds.map((id) =>
            changeStatusMutation.mutate({ id, status }),
          ),
        );
        showSuccess(
          tActions("bulkSuccess", { action: status, count: selectedIds.length }),
        );
        setSelectedIds([]);
        await refetch();
      } catch {
        showError(tActions("bulkFailed", { action: status }));
      } finally {
        setIsBulkProcessing(false);
      }
    },
    [selectedIds, changeStatusMutation, refetch, showSuccess, showError, tActions],
  );

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) return;
    setIsBulkProcessing(true);
    try {
      await Promise.allSettled(
        selectedIds.map((id) => deleteMutation.mutate(id)),
      );
      showSuccess(
        tActions("bulkSuccess", {
          action: tActions("delete").toLowerCase(),
          count: selectedIds.length,
        }),
      );
      setSelectedIds([]);
      await refetch();
    } catch {
      showError(
        tActions("bulkFailed", { action: tActions("delete").toLowerCase() }),
      );
    } finally {
      setIsBulkProcessing(false);
    }
  }, [selectedIds, deleteMutation, refetch, showSuccess, showError, tActions]);

  const handleEdit = useCallback((event: EventDocument) => {
    setEditTarget(event);
    setDrawerOpen(true);
  }, []);

  const handleEntries = useCallback((event: EventDocument) => {
    router.push(ROUTES.ADMIN.EVENT_ENTRIES(event.id));
  }, [router]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutate(deleteTarget.id);
    } catch {
      showError(t("confirmDelete"));
    }
  }, [deleteTarget, deleteMutation, showError, t]);

  const { columns } = useEventsTableColumns(handleEdit, handleEntries, (e) =>
    setDeleteTarget(e),
  );

  const sortOptions = useMemo(
    () =>
      EVENT_SORT_OPTIONS_KEYS.map((o) => ({
        value: o.value,
        label: t(o.key),
      })),
    [t],
  );

  const typeOptions = useMemo(
    () => [
      { value: "sale", label: t("typeSale") },
      { value: "offer", label: t("typeOffer") },
      { value: "poll", label: t("typePoll") },
      { value: "survey", label: t("typeSurvey") },
      { value: "feedback", label: t("typeFeedback") },
    ],
    [t],
  );

  const statusOptions = useMemo(
    () => [
      { value: "draft", label: tEventStatus("draft") },
      { value: "active", label: tEventStatus("active") },
      { value: "paused", label: tEventStatus("paused") },
      { value: "ended", label: tEventStatus("ended") },
    ],
    [tEventStatus],
  );

  return (
    <>
      <ListingLayout
        headerSlot={
          <AdminPageHeader
            title={t("title")}
            subtitle={`${t("subtitle")} — ${total} total`}
            actionLabel={t("newEvent")}
            onAction={() => {
              setEditTarget(null);
              setDrawerOpen(true);
            }}
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
              title={t("allTypes")}
              options={typeOptions}
              selected={stagedType}
              onChange={setStagedType}
              searchable={false}
            />
            <FilterFacetSection
              title={t("allStatuses")}
              options={statusOptions}
              selected={stagedStatus}
              onChange={setStagedStatus}
              searchable={false}
            />
          </>
        }
        filterActiveCount={filterActiveCount}
        onFilterApply={handleFilterApply}
        onFilterClear={handleFilterClear}
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        bulkActions={
          <>
            <Button
              size="sm"
              variant="primary"
              onClick={() => handleBulkStatusChange("active")}
              isLoading={isBulkProcessing}
            >
              {tActions("bulkPublish")}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkStatusChange("ended")}
              isLoading={isBulkProcessing}
            >
              {tActions("bulkArchive")}
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={handleBulkDelete}
              isLoading={isBulkProcessing}
            >
              {tActions("bulkDelete")}
            </Button>
          </>
        }
        loading={isLoading}
        paginationSlot={
          <TablePagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            total={total}
            onPageChange={table.setPage}
            onPageSizeChange={(ps) => table.set("pageSize", String(ps))}
          />
        }
      >
        <DataTable
          data={events}
          columns={columns}
          keyExtractor={(e) => e.id}
          loading={isLoading}
          emptyMessage={t("noEvents")}
          externalPagination
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          showViewToggle
          viewMode={(table.get("view") || "table") as "table" | "grid" | "list"}
          onViewModeChange={(mode) => table.set("view", mode)}
          mobileCardRender={(event) => (
            <Card className="overflow-hidden cursor-pointer">
              {event.coverImageUrl && (
                <div className="relative aspect-video overflow-hidden">
                  <MediaImage
                    src={event.coverImageUrl}
                    alt={event.title}
                    size="card"
                  />
                </div>
              )}
              <div className="p-3 space-y-2">
                <Text weight="medium" size="sm" className="line-clamp-2">
                  {event.title}
                </Text>
                <div className="flex items-center justify-between">
                  <Badge>{event.type}</Badge>
                  <StatusBadge status={event.status as any} />
                </div>
                <Caption>{formatDate(event.startsAt.toDate())}</Caption>
              </div>
            </Card>
          )}
        />
      </ListingLayout>

      <EventFormDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSuccess={() => {
          refetch();
          setDrawerOpen(false);
        }}
        editTarget={editTarget}
      />

      {deleteTarget && (
        <ConfirmDeleteModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title={`${tActions("delete")} "${deleteTarget.title}"?`}
          isDeleting={deleteMutation.isLoading}
        />
      )}
    </>
  );
}
