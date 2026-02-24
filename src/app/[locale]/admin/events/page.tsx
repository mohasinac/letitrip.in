"use client";

import { useState, useCallback } from "react";
import {
  AdminPageHeader,
  AdminFilterBar,
  DataTable,
  TablePagination,
  ConfirmDeleteModal,
} from "@/components";
import { UI_LABELS, ROUTES } from "@/constants";
import { useUrlTable, useMessage } from "@/hooks";
import {
  useEvents,
  getEventsTableColumns,
  EventFormDrawer,
} from "@/features/events";
import { useDeleteEvent, useChangeEventStatus } from "@/features/events";
import type { EventDocument } from "@/db/schema";

const LABELS = UI_LABELS.ADMIN.EVENTS;

export default function AdminEventsPage() {
  const { showSuccess, showError } = useMessage();
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
    showSuccess(UI_LABELS.ADMIN.EVENTS.CONFIRM_DELETE);
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
      showError(UI_LABELS.ADMIN.EVENTS.CONFIRM_DELETE);
    }
  }, [deleteTarget, deleteMutation, showError]);

  const { columns } = getEventsTableColumns(handleEdit, handleEntries, (e) =>
    setDeleteTarget(e),
  );

  return (
    <>
      <AdminPageHeader
        title={LABELS.TITLE}
        subtitle={LABELS.SUBTITLE}
        actionLabel={LABELS.NEW}
        onAction={() => {
          setEditTarget(null);
          setDrawerOpen(true);
        }}
      />

      <div className="space-y-4">
        <AdminFilterBar columns={3}>
          <input
            type="text"
            placeholder={UI_LABELS.ACTIONS.SEARCH}
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
            <option value="draft">{UI_LABELS.EVENT_STATUS.DRAFT}</option>
            <option value="active">{UI_LABELS.EVENT_STATUS.ACTIVE}</option>
            <option value="paused">{UI_LABELS.EVENT_STATUS.PAUSED}</option>
            <option value="ended">{UI_LABELS.EVENT_STATUS.ENDED}</option>
          </select>
        </AdminFilterBar>

        <DataTable
          data={events}
          columns={columns}
          keyExtractor={(e) => e.id}
          loading={isLoading}
          emptyMessage={LABELS.NO_EVENTS}
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
          title={`${UI_LABELS.ACTIONS.DELETE} "${deleteTarget.title}"?`}
          isDeleting={deleteMutation.isLoading}
        />
      )}
    </>
  );
}
