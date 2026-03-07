"use client";

/**
 * EventsListView
 *
 * Public-facing events listing page using the unified ListingLayout.
 * Supports status + type filters, sort, search, and pagination.
 * All state is URL-driven via useUrlTable.
 */

import { Suspense, useMemo } from "react";
import { CalendarDays } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  ActiveFilterChips,
  EmptyState,
  Heading,
  ListingLayout,
  Search,
  SortDropdown,
  TablePagination,
  Text,
  getFilterLabel,
} from "@/components";
import type { ActiveFilter } from "@/components";
import { EventFilters } from "@/components/filters";
import { THEME_CONSTANTS } from "@/constants";
import { useUrlTable, usePublicEvents, usePendingTable } from "@/hooks";
import { EventCard } from "./EventCard";

const PAGE_SIZE = 24;

function EventsListContent() {
  const t = useTranslations("events");
  const tActions = useTranslations("actions");
  const tTypes = useTranslations("eventTypes");

  const table = useUrlTable({
    defaults: { pageSize: String(PAGE_SIZE), sort: "-startsAt" },
  });

  const sortParam = table.get("sort") || "-startsAt";
  const page = table.getNumber("page", 1);
  const statusFilter = table.get("status");
  const typeFilter = table.get("type");

  const sortOptions = useMemo(
    () => [
      { value: "-startsAt", label: t("sortNewest") },
      { value: "endsAt", label: t("sortEndingSoon") },
      { value: "-endsAt", label: t("sortEndingLatest") },
    ],
    [t],
  );

  const statusOptions = useMemo(
    () => [
      { value: "active", label: t("filterStatusActive") },
      { value: "ended", label: t("filterStatusEnded") },
    ],
    [t],
  );

  const typeOptions = useMemo(
    () => [
      { value: "sale", label: tTypes("sale") },
      { value: "offer", label: tTypes("offer") },
      { value: "poll", label: tTypes("poll") },
      { value: "survey", label: tTypes("survey") },
      { value: "feedback", label: tTypes("feedback") },
    ],
    [tTypes],
  );

  // ── Staged filter state via usePendingTable ───────────────────────────
  const { pendingTable, filterActiveCount, onFilterApply, onFilterClear } =
    usePendingTable(table, ["status", "type"]);

  // ── API params ─────────────────────────────────────────────────────────
  const apiParams = useMemo(() => {
    const filterParts: string[] = [];
    if (statusFilter) filterParts.push(`status==${statusFilter}`);
    if (typeFilter) filterParts.push(`type==${typeFilter}`);
    const sp = new URLSearchParams({
      sorts: sortParam,
      page: String(page),
      pageSize: String(PAGE_SIZE),
    });
    if (filterParts.length) sp.set("filters", filterParts.join(","));
    const q = table.get("q");
    if (q) sp.set("q", q);
    return sp.toString();
  }, [statusFilter, typeFilter, sortParam, page, table]);

  const { events, total, isLoading } = usePublicEvents({ params: apiParams });
  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

  // ── Active filter chips ────────────────────────────────────────────────
  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const chips: ActiveFilter[] = [];
    if (statusFilter) {
      const label = getFilterLabel(statusOptions, statusFilter) ?? statusFilter;
      chips.push({ key: "status", label: t("filterStatus"), value: label });
    }
    if (typeFilter) {
      const label = getFilterLabel(typeOptions, typeFilter) ?? typeFilter;
      chips.push({ key: "type", label: t("filterType"), value: label });
    }
    return chips;
  }, [statusFilter, typeFilter, statusOptions, typeOptions, t]);

  const hasActiveFilters = filterActiveCount > 0 || Boolean(table.get("q"));

  return (
    <div className={`min-h-screen ${THEME_CONSTANTS.themed.bgSecondary}`}>
      <div className={`${THEME_CONSTANTS.page.container.full} py-8`}>
        <ListingLayout
          headerSlot={
            <div>
              <Heading level={1}>{t("title")}</Heading>
              <Text variant="secondary" className="mt-1">
                {total > 0
                  ? t("subtitleWithCount", { count: total })
                  : t("subtitle")}
              </Text>
            </div>
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
              value={sortParam}
              onChange={(v) => table.set("sort", v)}
              options={sortOptions}
            />
          }
          filterContent={<EventFilters table={pendingTable} />}
          filterActiveCount={filterActiveCount}
          onFilterApply={onFilterApply}
          onFilterClear={onFilterClear}
          activeFiltersSlot={
            activeFilters.length > 0 ? (
              <ActiveFilterChips
                filters={activeFilters}
                onRemove={(key) => table.set(key, "")}
                onClearAll={() => table.setMany({ status: "", type: "" })}
              />
            ) : undefined
          }
          paginationSlot={
            totalPages > 1 ? (
              <TablePagination
                total={total}
                currentPage={page}
                totalPages={totalPages}
                pageSize={PAGE_SIZE}
                onPageChange={table.setPage}
                onPageSizeChange={(n) => table.set("pageSize", String(n))}
                pageSizeOptions={[12, 24, 48]}
              />
            ) : undefined
          }
        >
          {!isLoading && events.length === 0 ? (
            <EmptyState
              icon={<CalendarDays className="w-16 h-16" />}
              title={t("noEventsFound")}
              description={t("noEventsSubtitle")}
              actionLabel={hasActiveFilters ? tActions("clearAll") : undefined}
              onAction={
                hasActiveFilters
                  ? () => {
                      onFilterClear();
                      table.set("q", "");
                    }
                  : undefined
              }
            />
          ) : (
            <div className={THEME_CONSTANTS.grid.cols4}>
              {isLoading
                ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700 aspect-[4/3]"
                    />
                  ))
                : events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
            </div>
          )}
        </ListingLayout>
      </div>
    </div>
  );
}

export function EventsListView() {
  return (
    <Suspense>
      <EventsListContent />
    </Suspense>
  );
}
