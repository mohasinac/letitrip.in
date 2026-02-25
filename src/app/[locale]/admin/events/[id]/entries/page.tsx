"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  AdminPageHeader,
  AdminFilterBar,
  DataTable,
  TablePagination,
} from "@/components";
import { ROUTES } from "@/constants";
import { useTranslations } from "next-intl";
import { useUrlTable, useMessage } from "@/hooks";
import {
  useEvent,
  useEventEntries,
  useEventStats,
  getEventEntriesTableColumns,
  EventStatsBanner,
  EntryReviewDrawer,
} from "@/features/events";
import type { EventEntryDocument } from "@/db/schema";

export default function AdminEventEntriesPage() {
  const params = useParams<{ id: string }>();
  const eventId = params.id;

  const table = useUrlTable({
    defaults: { pageSize: "25", sort: "-submittedAt" },
  });
  const [reviewEntry, setReviewEntry] = useState<EventEntryDocument | null>(
    null,
  );
  const { showSuccess } = useMessage();
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

  const { columns } = getEventEntriesTableColumns(handleReview);

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

      <div className="space-y-4 mt-4">
        <AdminFilterBar columns={2}>
          <select
            value={table.get("reviewStatus")}
            onChange={(e) => table.set("reviewStatus", e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="flagged">Flagged</option>
          </select>
          <select
            value={table.get("sorts")}
            onChange={(e) => table.setSort(e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm"
          >
            <option value="-submittedAt">Newest First</option>
            <option value="submittedAt">Oldest First</option>
            <option value="-points">Most Points</option>
          </select>
        </AdminFilterBar>

        <DataTable
          data={entries}
          columns={columns}
          keyExtractor={(e) => e.id}
          loading={isLoading}
          emptyMessage={tEmpty("noData")}
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
