"use client";

/**
 * EventsListView
 *
 * Public-facing events listing page using the unified ListingLayout.
 * Supports status + type filters, sort, search, and pagination.
 * All state is URL-driven via useUrlTable.
 */

import { Suspense, useCallback, useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Container,
  Grid,
  Heading,
  Text,
  TablePagination,
  Button,
  ListingLayout,
  SortDropdown,
  ActiveFilterChips,
} from "@mohasinac/appkit/ui";
import { usePendingTable } from "@mohasinac/appkit/react";
import { EmptyState, Search, getFilterLabel } from "@/components";
import type { ActiveFilter } from "@/components";
import { EventFilters } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { useUrlTable, useAuth, useMessage } from "@/hooks";
import { addToWishlistAction } from "@/actions";
import {
  useEvents,
  type EventItem,
  type EventListParams,
  type EventListResponse,
} from "@mohasinac/appkit/features/events";
import { EventCard } from "@/components";

const PAGE_SIZE = 24;

function EventsListContent({
  initialData,
}: {
  initialData?: EventListResponse;
}) {
  const t = useTranslations("events");
  const tActions = useTranslations("actions");
  const tTypes = useTranslations("eventTypes");
  const { user } = useAuth();
  const { showSuccess, showError } = useMessage();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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
  const apiParams = useMemo<EventListParams>(() => {
    const filterParts: string[] = [];
    if (statusFilter) filterParts.push(`status==${statusFilter}`);
    if (typeFilter) filterParts.push(`type==${typeFilter}`);
    const q = table.get("q");
    if (q) filterParts.push(`title@=*${q}`);

    return {
      sort: sortParam,
      page,
      pageSize: PAGE_SIZE,
      filters: filterParts.length ? filterParts.join(",") : undefined,
    };
  }, [statusFilter, typeFilter, sortParam, page, table]);

  const handleBulkAddToWishlist = useCallback(async () => {
    const results = await Promise.allSettled(
      selectedIds.map((id) => addToWishlistAction(id)),
    );
    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    if (succeeded === selectedIds.length) {
      showSuccess(tActions("bulkSuccess", { count: succeeded }));
    } else if (succeeded > 0) {
      showError(
        tActions("bulkPartialSuccess", {
          success: succeeded,
          total: selectedIds.length,
        }),
      );
    } else {
      showError(tActions("bulkFailed"));
    }
    setSelectedIds([]);
  }, [selectedIds, showSuccess, showError, tActions]);

  const { events, total, isLoading } = useEvents(apiParams, {
    initialData,
  });
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
      <Container size="full" className="py-8">
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
          selectedCount={selectedIds.length}
          onClearSelection={() => setSelectedIds([])}
          bulkActionItems={
            user
              ? [
                  {
                    id: "bulk-wishlist",
                    label: tActions("bulkAddToWishlist", {
                      count: selectedIds.length,
                    }),
                    variant: "primary",
                    onClick: handleBulkAddToWishlist,
                  },
                ]
              : undefined
          }
          toolbarPaginationSlot={
            totalPages > 1 ? (
              <TablePagination
                total={total}
                currentPage={page}
                totalPages={totalPages}
                pageSize={PAGE_SIZE}
                onPageChange={table.setPage}
                compact
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
            <Grid cols={4} gap="lg">
              {isLoading
                ? Array.from({ length: PAGE_SIZE }).map((_, i) => (
                    <div
                      key={i}
                      className="animate-pulse rounded-xl bg-zinc-200 dark:bg-slate-700 aspect-[4/3]"
                    />
                  ))
                : events.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      selectable={!!user}
                      selected={selectedIds.includes(event.id)}
                      onSelect={(id, sel) =>
                        setSelectedIds((prev) =>
                          sel ? [...prev, id] : prev.filter((x) => x !== id),
                        )
                      }
                    />
                  ))}
            </Grid>
          )}
        </ListingLayout>
      </Container>
    </div>
  );
}

export function EventsListView({
  initialData,
}: { initialData?: EventListResponse } = {}) {
  return (
    <Suspense>
      <EventsListContent initialData={initialData} />
    </Suspense>
  );
}
