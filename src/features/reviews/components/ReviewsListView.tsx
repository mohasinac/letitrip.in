"use client";

/**
 * ReviewsListView
 *
 * Public reviews showcase. Displays featured/approved customer reviews
 * with rating filter, sort, and search — all URL-driven via useUrlTable.
 */

import { Suspense, useCallback, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  ActiveFilterChips,
  Container,
  DataTable,
  EmptyState,
  Heading,
  ListingLayout,
  REVIEW_SORT_OPTIONS,
  ReviewFilters,
  Search,
  SortDropdown,
  TablePagination,
  Text,
  getFilterLabel,
} from "@/components";
import type { ActiveFilter } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { usePendingTable, useUrlTable, useBrands } from "@/hooks";
import { ReviewCard } from "@/components";
import type { ReviewDocument } from "@/db/schema";
import { useReviews, type ReviewsApiResult } from "../hooks/useReviews";

export interface ReviewsListResult {
  items: ReviewDocument[];
}

const PAGE_SIZE = 12;

function ReviewsListContent({
  initialData,
}: {
  initialData?: ReviewsApiResult;
}) {
  const t = useTranslations("reviews");
  const tActions = useTranslations("actions");
  const table = useUrlTable({ defaults: { pageSize: String(PAGE_SIZE) } });
  const search = table.get("q");
  const sortParam = table.get("sorts") || "-rating";
  const ratingFilter = table.get("rating");
  const brandFilter = table.get("brand");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const viewMode = (table.get("view") || "grid") as "grid" | "list";

  // Server-side: rating filter + sort. Client-side: search + pagination over fetched set.
  const queryParams = useMemo(() => {
    const p = new URLSearchParams();
    p.set("latest", "true");
    p.set("pageSize", "200");
    p.set("sorts", sortParam);
    if (ratingFilter) p.set("filters", `rating==${ratingFilter}`);
    return p.toString();
  }, [ratingFilter, sortParam]);

  const { data, isLoading, error } = useReviews(queryParams, { initialData });

  const allReviews = useMemo(() => data ?? [], [data]);

  // Client-side search only (rating + sort are server-side)
  const displayed = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    const b = (brandFilter || "").trim();
    return allReviews.filter((r) => {
      if (
        q &&
        !(r.comment || "").toLowerCase().includes(q) &&
        !(r.title || "").toLowerCase().includes(q) &&
        !(r.userName || "").toLowerCase().includes(q) &&
        !(r.productTitle || "").toLowerCase().includes(q)
      ) {
        return false;
      }
      if (b && (r as any).brandId !== b) {
        return false;
      }
      return true;
    });
  }, [allReviews, search, brandFilter]);

  const total = allReviews.length;
  const page = table.getNumber("page", 1);
  const pageSize = table.getNumber("pageSize", PAGE_SIZE);
  const paged = displayed.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(displayed.length / pageSize) || 1;

  const sortOptions = useMemo(
    () => REVIEW_SORT_OPTIONS.map((o) => ({ value: o.value, label: t(o.key) })),
    [t],
  );

  const ratingOptions = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((r) => ({
        label: t("stars", { count: r }),
        value: String(r),
      })),
    [t],
  );

  const filterActiveCount = (ratingFilter ? 1 : 0) + (brandFilter ? 1 : 0);

  // ── Staged filter state via usePendingTable ───────────────────
  const {
    pendingTable,
    onFilterApply,
    onFilterClear: handleClearFilters,
  } = usePendingTable(table, ["rating", "brand"]);

  const { brandOptions } = useBrands();

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];
    if (ratingFilter) {
      const label = getFilterLabel(ratingOptions, ratingFilter) ?? ratingFilter;
      filters.push({ key: "rating", label: t("filterRating"), value: label });
    }
    if (brandFilter) {
      filters.push({
        key: "brand",
        label: t("filterBrand"),
        value:
          brandOptions.find((b) => b.value === brandFilter)?.label ??
          brandFilter,
      });
    }
    return filters;
  }, [ratingFilter, brandFilter, ratingOptions, brandOptions, t]);

  const handleClearAll = useCallback(() => {
    handleClearFilters();
    table.clear(["q", "rating", "brand", "sorts"]);
  }, [handleClearFilters, table]);

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
              value={search}
              onChange={(v) => table.set("q", v)}
              placeholder={t("searchPlaceholder")}
              onClear={() => table.set("q", "")}
            />
          }
          sortSlot={
            <SortDropdown
              value={sortParam}
              onChange={(v) => table.set("sorts", v)}
              options={sortOptions}
            />
          }
          filterContent={
            <ReviewFilters
              table={pendingTable}
              variant="public"
              brandOptions={brandOptions}
            />
          }
          filterActiveCount={filterActiveCount}
          onFilterApply={onFilterApply}
          onFilterClear={handleClearAll}
          activeFiltersSlot={
            activeFilters.length > 0 ? (
              <ActiveFilterChips
                filters={activeFilters}
                onRemove={(key) => table.set(key, "")}
                onClearAll={handleClearAll}
              />
            ) : undefined
          }
          paginationSlot={
            totalPages > 1 ? (
              <TablePagination
                total={displayed.length}
                currentPage={page}
                totalPages={totalPages}
                pageSize={pageSize}
                onPageChange={table.setPage}
                onPageSizeChange={(n) => table.set("pageSize", String(n))}
                pageSizeOptions={[12, 24, 48]}
              />
            ) : undefined
          }
        >
          {!isLoading && error ? (
            <EmptyState
              title={t("noReviewsFound")}
              description={t("noReviewsSubtitle")}
            />
          ) : (
            <DataTable
              data={paged}
              keyExtractor={(item) => item.id}
              loading={isLoading}
              columns={[
                { key: "userName", header: t("colUser") },
                { key: "productTitle", header: t("colProduct") },
                { key: "rating", header: t("filterRating") },
                { key: "createdAt", header: t("colDate") },
              ]}
              selectable
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              showViewToggle
              showTableView={false}
              viewMode={viewMode}
              onViewModeChange={(m) => table.set("view", m)}
              labels={{
                gridView: tActions("gridView"),
                listView: tActions("listView"),
              }}
              emptyState={
                <EmptyState
                  icon={<Star className="w-16 h-16" />}
                  title={t("noReviewsFound")}
                  description={t("noReviewsSubtitle")}
                  actionLabel={
                    search || ratingFilter ? tActions("clearAll") : undefined
                  }
                  onAction={search || ratingFilter ? handleClearAll : undefined}
                />
              }
              mobileCardRender={(review) => (
                <ReviewCard review={review as any} />
              )}
            />
          )}
        </ListingLayout>
      </Container>
    </div>
  );
}

export function ReviewsListView({
  initialData,
}: { initialData?: ReviewsApiResult } = {}) {
  return (
    <Suspense>
      <ReviewsListContent initialData={initialData} />
    </Suspense>
  );
}
