"use client";

/**
 * ReviewsListView
 *
 * Public reviews showcase. Displays featured/approved customer reviews
 * with rating filter, sort, and search — all URL-driven via useUrlTable.
 */

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  ActiveFilterChips,
  DataTable,
  EmptyState,
  FilterFacetSection,
  Heading,
  ListingLayout,
  Search,
  SortDropdown,
  TablePagination,
  Text,
} from "@/components";
import type { ActiveFilter } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { useApiQuery, useUrlTable } from "@/hooks";
import { reviewService } from "@/services";
import { ReviewCard } from "./ReviewCard";
import type { ReviewDocument } from "@/db/schema";

const PAGE_SIZE = 12;

const REVIEW_SORT_OPTIONS_KEYS = [
  { value: "-createdAt", key: "sortNewest" },
  { value: "createdAt", key: "sortOldest" },
  { value: "-rating", key: "sortHighestRated" },
  { value: "rating", key: "sortLowestRated" },
] as const;

interface ReviewsApiResponse {
  data: ReviewDocument[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

function ReviewsListContent() {
  const t = useTranslations("reviews");
  const tActions = useTranslations("actions");
  const table = useUrlTable({ defaults: { pageSize: String(PAGE_SIZE) } });
  const search = table.get("q");
  const sortParam = table.get("sorts") || "-rating";
  const ratingFilter = table.get("rating");

  const queryParams = useMemo(() => {
    const p = new URLSearchParams();
    p.set("featured", "true");
    p.set("pageSize", "50");
    return p.toString();
  }, []);

  const { data, isLoading, error } = useApiQuery<ReviewsApiResponse>({
    queryKey: ["reviews", "featured", queryParams],
    queryFn: () => reviewService.list(queryParams),
  });

  const allReviews = useMemo(() => data?.data ?? [], [data]);

  // Client-side filter + sort + search (featured reviews are a small set)
  const displayed = useMemo(() => {
    let filtered = [...allReviews];

    // Rating filter
    if (ratingFilter) {
      const minRating = Number(ratingFilter);
      if (!isNaN(minRating)) {
        filtered = filtered.filter((r) => r.rating === minRating);
      }
    }

    // Search
    const q = (search || "").trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(
        (r) =>
          (r.comment || "").toLowerCase().includes(q) ||
          (r.title || "").toLowerCase().includes(q) ||
          (r.userName || "").toLowerCase().includes(q) ||
          (r.productTitle || "").toLowerCase().includes(q),
      );
    }

    // Sort
    filtered.sort((a, b) => {
      const desc = sortParam.startsWith("-");
      const field = desc ? sortParam.slice(1) : sortParam;
      const aVal =
        field === "rating" ? a.rating : new Date(a.createdAt).getTime();
      const bVal =
        field === "rating" ? b.rating : new Date(b.createdAt).getTime();
      return desc ? bVal - aVal : aVal - bVal;
    });

    return filtered;
  }, [allReviews, ratingFilter, search, sortParam]);

  const total = allReviews.length;
  const page = table.getNumber("page", 1);
  const pageSize = table.getNumber("pageSize", PAGE_SIZE);
  const paged = displayed.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(displayed.length / pageSize) || 1;

  const sortOptions = useMemo(
    () =>
      REVIEW_SORT_OPTIONS_KEYS.map((o) => ({
        value: o.value,
        label: t(o.key),
      })),
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

  const filterActiveCount = ratingFilter ? 1 : 0;

  // ── Staged filter state ────────────────────────────────────────────
  const [stagedRating, setStagedRating] = useState<string[]>(
    ratingFilter ? [ratingFilter] : [],
  );

  useEffect(() => {
    setStagedRating(ratingFilter ? [ratingFilter] : []);
  }, [ratingFilter]);

  const handleFilterApply = useCallback(() => {
    table.set("rating", stagedRating[0] || "");
  }, [stagedRating, table]);

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    if (!ratingFilter) return [];
    const label =
      ratingOptions.find((o) => o.value === ratingFilter)?.label ??
      ratingFilter;
    return [{ key: "rating", label: t("filterRating"), value: label }];
  }, [ratingFilter, ratingOptions, t]);

  const handleClearFilters = useCallback(() => {
    setStagedRating([]);
    table.clear(["q", "rating", "sorts"]);
  }, [table]);

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
            <FilterFacetSection
              title={t("filterRating")}
              options={ratingOptions}
              selected={stagedRating}
              onChange={setStagedRating}
              selectionMode="single"
            />
          }
          filterActiveCount={filterActiveCount}
          onFilterApply={handleFilterApply}
          onFilterClear={handleClearFilters}
          activeFiltersSlot={
            activeFilters.length > 0 ? (
              <ActiveFilterChips
                filters={activeFilters}
                onRemove={(key) => table.set(key, "")}
                onClearAll={handleClearFilters}
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
              showViewToggle
              viewMode={
                (table.get("view") || "grid") as "table" | "grid" | "list"
              }
              onViewModeChange={(m) => table.set("view", m)}
              emptyState={
                <EmptyState
                  icon={<Star className="w-16 h-16" />}
                  title={t("noReviewsFound")}
                  description={t("noReviewsSubtitle")}
                  actionLabel={
                    search || ratingFilter ? tActions("clearAll") : undefined
                  }
                  onAction={
                    search || ratingFilter ? handleClearFilters : undefined
                  }
                />
              }
              mobileCardRender={(review) => (
                <ReviewCard review={review as any} />
              )}
            />
          )}
        </ListingLayout>
      </div>
    </div>
  );
}

export function ReviewsListView() {
  return (
    <Suspense>
      <ReviewsListContent />
    </Suspense>
  );
}
