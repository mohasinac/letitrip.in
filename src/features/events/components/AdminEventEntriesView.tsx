"use client";

import { Select } from "@mohasinac/appkit/ui";
import { TablePagination, DataTable } from "@mohasinac/appkit/ui";

import { useState, useCallback, Suspense } from "react";
import {
  AdminPageHeader, AdminFilterBar } from "@/components";
import { ROUTES, THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import { useUrlTable } from "@/hooks";
import {
  useEvent,
  useEventEntries,
  useEventStats,
  useEventEntriesTableColumns,
  EventStatsBanner,
  EntryReviewDrawer,
} from "@/features/events";
import type { EventEntryDocument } from "@/db/schema";

const { spacing } = THEME_CONSTANTS;

interface AdminEventEntriesViewProps {
  eventId: string;
}

function AdminEventEntriesContent({ eventId }: AdminEventEntriesViewProps) {
  const table = useUrlTable({
    defaults: { pageSize: "25", sort: "-submittedAt" },
  });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [reviewEntry, setReviewEntry] = useState<EventEntryDocument | null>(
    null,
  );
  const t = useTranslations("adminEvents");
  const tEmpty = useTranslations("empty");

  const queryParams = table.params.toString();
  const { event, isLoading: eventLoading } = useEvent({ id: eventId });
  const { entries, total, page, pageSize, totalPages, isLoading, refetch } =
    useEventEntries({ eventId, params: queryParams });
  const { stats } = useEventStats({ eventId });

  const handleReview = useCallback((entry: EventEntryDocument) => {
    setReviewEntry(entry);
  }, []);

  const { columns } = useEventEntriesTableColumns(handleReview);

  return (
    <>
      <AdminPageHeader
        title={t("entries")}
        subtitle={event?.title ?? ""}
        breadcrumb={[
          { label: t("title"), href: ROUTES.ADMIN.EVENTS },
          { label: event?.title ?? eventId },
        ]}
      />

      {stats && (
        <EventStatsBanner
          totalEntries={stats.totalEntries}
          approvedEntries={stats.approvedEntries}
          flaggedEntries={stats.flaggedEntries}
          pendingEntries={stats.pendingEntries}
          isLoading={eventLoading}
        />
      )}

      <div className={`${spacing.stack} mt-4`}>
        <AdminFilterBar columns={2}>
          <Select
            value={table.get("reviewStatus")}
            onChange={(e) => table.set("reviewStatus", e.target.value)}
            className="w-full"
            options={[
              { value: "", label: t("allStatuses") },
              { value: "pending", label: t("statusPending") },
              { value: "approved", label: t("statusApproved") },
              { value: "flagged", label: t("statusFlagged") },
            ]}
          />
          <Select
            value={table.get("sorts")}
            onChange={(e) => table.setSort(e.target.value)}
            className="w-full"
            options={[
              { value: "-submittedAt", label: t("sortNewest") },
              { value: "submittedAt", label: t("sortOldest") },
              { value: "-points", label: t("sortMostPoints") },
            ]}
          />
        </AdminFilterBar>

        <DataTable
          data={entries}
          columns={columns}
          keyExtractor={(e) => e.id}
          loading={isLoading}
          emptyMessage={tEmpty("noData")}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
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

      <EntryReviewDrawer
        entry={reviewEntry}
        eventId={eventId}
        isOpen={!!reviewEntry}
        onClose={() => setReviewEntry(null)}
        onSuccess={() => {
          refetch();
          setReviewEntry(null);
        }}
      />
    </>
  );
}

export function AdminEventEntriesView(props: AdminEventEntriesViewProps) {
  return (
    <Suspense>
      <AdminEventEntriesContent {...props} />
    </Suspense>
  );
}
