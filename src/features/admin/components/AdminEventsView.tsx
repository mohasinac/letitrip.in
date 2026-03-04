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
  Badge,
  Caption,
  Card,
  DataTable,
  MediaImage,
  StatusBadge,
  TablePagination,
  Text,
  ConfirmDeleteModal,
  Input,
  Select,
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
          <Input
            type="text"
            placeholder={tActions("search")}
            value={table.get("q")}
            onChange={(e) => table.set("q", e.target.value)}
          />
          <Select
            value={table.get("type")}
            onChange={(e) => table.set("type", e.target.value)}
            options={[
              { value: "", label: t("allTypes") },
              { value: "sale", label: t("typeSale") },
              { value: "offer", label: t("typeOffer") },
              { value: "poll", label: t("typePoll") },
              { value: "survey", label: t("typeSurvey") },
              { value: "feedback", label: t("typeFeedback") },
            ]}
          />
          <Select
            value={table.get("status")}
            onChange={(e) => table.set("status", e.target.value)}
            options={[
              { value: "", label: t("allStatuses") },
              { value: "draft", label: tEventStatus("draft") },
              { value: "active", label: tEventStatus("active") },
              { value: "paused", label: tEventStatus("paused") },
              { value: "ended", label: tEventStatus("ended") },
            ]}
          />
        </AdminFilterBar>

        <DataTable
          data={events}
          columns={columns}
          keyExtractor={(e) => e.id}
          loading={isLoading}
          emptyMessage={t("noEvents")}
          externalPagination
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
