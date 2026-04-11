/**
 * AdminEventsView
 *
 * Tier 2 — feature component.
 * Extracted from src/app/[locale]/admin/events/page.tsx (was 153 lines).
 * Manages the admin events list with filtering, pagination, and CRUD.
 * Uses the unified ListingLayout shell.
 */

"use client";

import { useState, useCallback, useMemo, Suspense } from "react";
import { useRouter } from "@/i18n/navigation";
import { Caption, Text } from "@mohasinac/appkit/ui";
import { usePendingTable } from "@mohasinac/appkit/react";
import {
  AdminPageHeader,
  Badge,
  Button,
  Card,
  DataTable,
  EventFilters,
  ListingLayout,
  MediaImage,
  Search,
  SortDropdown,
  StatusBadge,
  TablePagination,
  ConfirmDeleteModal,
} from "@/components";
import { formatDate } from "@/utils";
import { ROUTES, THEME_CONSTANTS } from "@/constants";

const { flex } = THEME_CONSTANTS;
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

function AdminEventsContent() {
  const { showSuccess, showError } = useMessage();
  const router = useRouter();
  const t = useTranslations("adminEvents");
  const tActions = useTranslations("actions");
  const table = useUrlTable({
    defaults: { pageSize: "25", sort: "-createdAt" },
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EventDocument | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EventDocument | null>(null);

  // ── Bulk selection state ────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  // ── Filter state (pending until Apply) ─────────────────────────────
  const typeFilter = table.get("type");
  const statusFilter = table.get("status");

  const { pendingTable, filterActiveCount, onFilterApply, onFilterClear } =
    usePendingTable(table, ["type", "status"]);

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
            changeStatusMutation.mutateAsync({ id, status }),
          ),
        );
        showSuccess(
          tActions("bulkSuccess", {
            action: status,
            count: selectedIds.length,
          }),
        );
        setSelectedIds([]);
        await refetch();
      } catch {
        showError(tActions("bulkFailed", { action: status }));
      } finally {
        setIsBulkProcessing(false);
      }
    },
    [
      selectedIds,
      changeStatusMutation,
      refetch,
      showSuccess,
      showError,
      tActions,
    ],
  );

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) return;
    setIsBulkProcessing(true);
    try {
      await Promise.allSettled(
        selectedIds.map((id) => deleteMutation.mutateAsync(id)),
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

  const handleEntries = useCallback(
    (event: EventDocument) => {
      router.push(ROUTES.ADMIN.EVENT_ENTRIES(event.id));
    },
    [router],
  );

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
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
        filterContent={<EventFilters table={pendingTable} />}
        filterActiveCount={filterActiveCount}
        onFilterApply={onFilterApply}
        onFilterClear={onFilterClear}
        selectedCount={selectedIds.length}
        onClearSelection={() => setSelectedIds([])}
        bulkActionItems={[
          {
            id: "bulk-publish",
            label: tActions("bulkPublish"),
            variant: "primary",
            onClick: () => handleBulkStatusChange("active"),
            loading: isBulkProcessing,
          },
          {
            id: "bulk-archive",
            label: tActions("bulkArchive"),
            variant: "outline",
            onClick: () => handleBulkStatusChange("ended"),
            loading: isBulkProcessing,
          },
          {
            id: "bulk-delete",
            label: tActions("bulkDelete"),
            variant: "danger",
            onClick: handleBulkDelete,
            loading: isBulkProcessing,
          },
        ]}
        loading={isLoading}
        toolbarPaginationSlot={
          <TablePagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            total={total}
            onPageChange={table.setPage}
            compact
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
                <div className={`${flex.between}`}>
                  <Badge>{event.type}</Badge>
                  <StatusBadge status={event.status as any} />
                </div>
                <Caption>{formatDate(event.startsAt)}</Caption>
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
          isDeleting={deleteMutation.isPending}
        />
      )}
    </>
  );
}

export function AdminEventsView() {
  return (
    <Suspense>
      <AdminEventsContent />
    </Suspense>
  );
}
