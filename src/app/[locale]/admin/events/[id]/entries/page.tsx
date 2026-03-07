"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  AdminPageHeader,
  AdminFilterBar,
  DataTable,
  Select,
  TablePagination,
} from "@/components";
import { ROUTES, THEME_CONSTANTS } from "@/constants";

const { spacing } = THEME_CONSTANTS;
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

export default function AdminEventEntriesPage() {
  const params = useParams<{ id: string }>();
  const eventId = params.id;

  const table = useUrlTable({
    defaults: { pageSize: "25", sort: "-submittedAt" },
  });
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
              { value: "", label: "All Statuses" },
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "flagged", label: "Flagged" },
            ]}
          />
          <Select
            value={table.get("sorts")}
            onChange={(e) => table.setSort(e.target.value)}
            className="w-full"
            options={[
              { value: "-submittedAt", label: "Newest First" },
              { value: "submittedAt", label: "Oldest First" },
              { value: "-points", label: "Most Points" },
            ]}
          />
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
