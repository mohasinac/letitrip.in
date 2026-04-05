"use client";

/**
 * BlogListView
 *
 * Public-facing blog listing page using the unified ListingLayout.
 * Supports category filter, sort, search, and pagination.
 * All state is URL-driven via useUrlTable.
 */

import { Suspense, useCallback, useMemo, useState } from "react";
import { BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  ActiveFilterChips,
  Button,
  Container,
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
import { BlogFilters } from "@/components";
import { BlogCard } from "@/components";
import { BlogFeaturedCard } from "./BlogFeaturedCard";
import { THEME_CONSTANTS } from "@/constants";
import { useUrlTable, usePendingTable, useAuth, useMessage } from "@/hooks";
import { addToWishlistAction } from "@/actions";
import {
  useBlogPosts,
  type BlogListParams,
  type BlogListResponse,
} from "@mohasinac/feat-blog";

const PAGE_SIZE = 24;

function BlogListContent({ initialData }: { initialData?: BlogListResponse }) {
  const t = useTranslations("blog");
  const tActions = useTranslations("actions");
  const tFilters = useTranslations("filters");
  const { user } = useAuth();
  const { showSuccess, showError } = useMessage();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const table = useUrlTable({
    defaults: { pageSize: String(PAGE_SIZE), sort: "-publishedAt" },
  });

  const sortParam = table.get("sort") || "-publishedAt";
  const page = table.getNumber("page", 1);
  const categoryFilter = table.get("category");
  const viewMode = (table.get("view") || "grid") as "grid" | "list";

  const sortOptions = useMemo(
    () => [
      { value: "-publishedAt", label: t("sortNewest") },
      { value: "publishedAt", label: t("sortOldest") },
      { value: "title", label: t("sortTitle") },
    ],
    [t],
  );

  // Category filter options (translated)
  const categoryOptions = useMemo(
    () => [
      { value: "news", label: tFilters("blogCategoryNews") },
      { value: "tips", label: tFilters("blogCategoryTips") },
      { value: "guides", label: tFilters("blogCategoryGuides") },
      { value: "updates", label: tFilters("blogCategoryUpdates") },
      { value: "community", label: tFilters("blogCategoryCommunity") },
    ],
    [tFilters],
  );

  // ── Staged filter state via usePendingTable ───────────────────────────
  const { pendingTable, filterActiveCount, onFilterApply, onFilterClear } =
    usePendingTable(table, ["category"]);

  // ── API params ─────────────────────────────────────────────────────────
  const queryParams = useMemo<BlogListParams>(() => {
    const q = table.get("q") || undefined;

    return {
      page,
      perPage: PAGE_SIZE,
      category: categoryFilter as BlogListParams["category"] | undefined,
      sort: sortParam,
      q,
    };
  }, [page, categoryFilter, sortParam, table]);

  const { posts, total, totalPages, isLoading } = useBlogPosts(queryParams, {
    initialData,
  });

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
                    icon={<BookOpen className="w-16 h-16" />}
                    title={t("noArticlesFound")}
                    description={t("noArticlesSubtitle")}
                  />
                }
                mobileCardRender={(post) => (
                  <BlogCard
                    post={post as any}
                    selectable={!!user}
                    selected={selectedIds.includes(post.id)}
                    onSelect={(id, sel) =>
                      setSelectedIds((prev) =>
                        sel ? [...prev, id] : prev.filter((x) => x !== id),
                      )
                    }
                  />
                )}
              />
            </div>
          )}
        </ListingLayout>
      </Container>
    </div>
  );
}

export function BlogListView({
  initialData,
}: { initialData?: BlogListResponse } = {}) {
  return (
    <Suspense>
      <BlogListContent initialData={initialData} />
    </Suspense>
  );
}
