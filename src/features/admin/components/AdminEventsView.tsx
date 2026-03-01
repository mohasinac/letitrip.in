/**
 * AdminEventsView
 *
 * Tier 2 — feature component.
 * Extracted from src/app/[locale]/admin/events/page.tsx (was 153 lines).
 * Manages the admin events list with filtering, pagination, and CRUD.
 */

"use client";

import { useState, useCallback } from "react";
import {
  AdminPageHeader,
  AdminFilterBar,
  DataTable,
  TablePagination,
  ConfirmDeleteModal,
} from "@/components";
import { ROUTES } from "@/constants";
import { useTranslations } from "next-intl";
import { useUrlTable, useMessage } from "@/hooks";
import {
  useEvents,
  useEventsTableColumns,
  EventFormDrawer,
  useDeleteEvent,
} from "@/features/events";
import type { EventDocument } from "@/db/schema";

export function AdminEventsView() {
  const { showSuccess, showError } = useMessage();
  const t = useTranslations("adminEvents");
  const tActions = useTranslations("actions");
  const tEventStatus = useTranslations("eventStatus");
  const table = useUrlTable({
    defaults: { pageSize: "25", sort: "-createdAt" },
  });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EventDocument | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EventDocument | null>(null);

  const params = table.params.toString();
  const { events, total, page, pageSize, totalPages, isLoading, refetch } =
    useEvents({ params });

  const deleteMutation = useDeleteEvent(() => {
    showSuccess(t("confirmDelete"));
    setDeleteTarget(null);
    refetch();
  });

  const handleEdit = useCallback((event: EventDocument) => {
    setEditTarget(event);
    setDrawerOpen(true);
  }, []);

  const handleEntries = useCallback((event: EventDocument) => {
    window.location.href = ROUTES.ADMIN.EVENT_ENTRIES(event.id);
  }, []);

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

  return (
    <>
      <AdminPageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actionLabel={t("newEvent")}
        onAction={() => {
          setEditTarget(null);
          setDrawerOpen(true);
        }}
      />

      <div className="space-y-4">
        <AdminFilterBar columns={3}>
          <input
            type="text"
            placeholder={tActions("search")}
            value={table.get("q")}
            onChange={(e) => table.set("q", e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm"
          />
          <select
            value={table.get("type")}
            onChange={(e) => table.set("type", e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm"
          >
            <option value="">All Types</option>
            <option value="sale">Sale</option>
            <option value="offer">Offer</option>
            <option value="poll">Poll</option>
            <option value="survey">Survey</option>
            <option value="feedback">Feedback</option>
          </select>
          <select
            value={table.get("status")}
            onChange={(e) => table.set("status", e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="draft">{tEventStatus("draft")}</option>
            <option value="active">{tEventStatus("active")}</option>
            <option value="paused">{tEventStatus("paused")}</option>
            <option value="ended">{tEventStatus("ended")}</option>
          </select>
        </AdminFilterBar>

        <DataTable
          data={events}
          columns={columns}
          keyExtractor={(e) => e.id}
          loading={isLoading}
          emptyMessage={t("noEvents")}
          externalPagination
        />

        <TablePagination
          total={total}
          currentPage={page}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={(p) => table.setPage(p)}
          onPageSizeChange={(ps) => table.set("pageSize", String(ps))}
        />
      </div>

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
