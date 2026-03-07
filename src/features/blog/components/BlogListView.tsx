"use client";

/**
 * BlogListView
 *
 * Public-facing blog listing page using the unified ListingLayout.
 * Supports category filter, sort, search, and pagination.
 * All state is URL-driven via useUrlTable.
 */

import { Suspense, useMemo } from "react";
import { BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  ActiveFilterChips,
  DataTable,
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
import { BlogFilters } from "@/components/filters";
import { BlogCard } from "./BlogCard";
import { BlogFeaturedCard } from "./BlogFeaturedCard";
import { BLOG_CATEGORY_TABS } from "./BlogCategoryTabs";
import { THEME_CONSTANTS } from "@/constants";
import { useUrlTable, useBlogPosts, usePendingTable } from "@/hooks";

const PAGE_SIZE = 24;

function BlogListContent() {
  const t = useTranslations("blog");
  const tActions = useTranslations("actions");

  const table = useUrlTable({
    defaults: { pageSize: String(PAGE_SIZE), sort: "-publishedAt" },
  });

  const sortParam = table.get("sort") || "-publishedAt";
  const page = table.getNumber("page", 1);
  const categoryFilter = table.get("category");

  const sortOptions = useMemo(
    () => [
      { value: "-publishedAt", label: t("sortNewest") },
      { value: "publishedAt", label: t("sortOldest") },
      { value: "title", label: t("sortTitle") },
    ],
    [t],
  );

  // Category filter options from BLOG_CATEGORY_TABS (excluding "All")
  const categoryOptions = useMemo(
    () =>
      BLOG_CATEGORY_TABS.filter((tab) => tab.key !== "").map((tab) => ({
        value: tab.key,
        label: tab.label,
      })),
    [],
  );

  // ── Staged filter state via usePendingTable ───────────────────────────
  const { pendingTable, filterActiveCount, onFilterApply, onFilterClear } =
    usePendingTable(table, ["category"]);

  // ── API params ─────────────────────────────────────────────────────────
  const queryParams = useMemo(() => {
    const sp = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
    });
    if (categoryFilter) sp.set("category", categoryFilter);
    if (sortParam) sp.set("sorts", sortParam);
    const q = table.get("q");
    if (q) sp.set("q", q);
    return sp.toString();
  }, [page, categoryFilter, sortParam, table]);

  const { posts, data, isLoading } = useBlogPosts(queryParams);
  const total = data?.meta?.total ?? 0;
  const totalPages = data?.meta?.totalPages ?? 1;

  const featuredPost = page === 1 ? posts.find((p) => p.isFeatured) : undefined;
  const regularPosts = featuredPost
    ? posts.filter((p) => p.id !== featuredPost.id)
    : posts;

  // ── Active filter chips ────────────────────────────────────────────────
  const activeFilters = useMemo<ActiveFilter[]>(() => {
    if (!categoryFilter) return [];
    const label =
      getFilterLabel(categoryOptions, categoryFilter) ?? categoryFilter;
    return [{ key: "category", label: t("filterCategory"), value: label }];
  }, [categoryFilter, categoryOptions, t]);

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
          filterContent={<BlogFilters table={pendingTable} variant="public" />}
          filterActiveCount={filterActiveCount}
          onFilterApply={onFilterApply}
          onFilterClear={onFilterClear}
          activeFiltersSlot={
            activeFilters.length > 0 ? (
              <ActiveFilterChips
                filters={activeFilters}
                onRemove={() => table.set("category", "")}
                onClearAll={() => table.set("category", "")}
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
          {!isLoading && posts.length === 0 ? (
            <EmptyState
              icon={<BookOpen className="w-16 h-16" />}
              title={t("noArticlesFound")}
              description={t("noArticlesSubtitle")}
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
            <div className={THEME_CONSTANTS.spacing.stack}>
              {featuredPost && <BlogFeaturedCard post={featuredPost} />}

              <DataTable
                data={regularPosts}
                keyExtractor={(item) => item.id}
                loading={isLoading}
                columns={[
                  { key: "title", header: t("colTitle") },
                  { key: "category", header: t("filterCategory") },
                  { key: "authorName", header: t("colAuthor") },
                  { key: "publishedAt", header: t("colPublishedAt") },
                ]}
                defaultViewMode="grid"
                emptyState={
                  <EmptyState
                    icon={<BookOpen className="w-16 h-16" />}
                    title={t("noArticlesFound")}
                    description={t("noArticlesSubtitle")}
                  />
                }
                mobileCardRender={(post) => <BlogCard post={post as any} />}
              />
            </div>
          )}
        </ListingLayout>
      </div>
    </div>
  );
}

export function BlogListView() {
  return (
    <Suspense>
      <BlogListContent />
    </Suspense>
  );
}
